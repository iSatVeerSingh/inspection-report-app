import { Link, useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import Card from "../../components/Card";
import { useEffect, useRef, useState } from "react";
import clientApi from "../../api/clientApi";
import { Job, JobStatus } from "../../types";
import Loading from "../../components/Loading";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import MiniDetail from "../../components/MiniDetail";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOutline from "../../components/ButtonOutline";
import FormInput from "../../components/FormInput";
import { LocationIcon, UserIcon } from "../../icons";
import { inspectionApi } from "../../api";

const JobDetails = () => {
  const { jobNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const prevJobRef = useRef<HTMLInputElement>(null);
  const [searching, setSearching] = useState(false);
  const [online, setOnline] = useState(false);
  const [previousJob, setPreviousJob] = useState<Job | null>(null);

  useEffect(() => {
    (async () => {
      const response = await clientApi.get(`/jobs?jobNumber=${jobNumber}`);
      if (response.status !== 200) {
        return;
      }
      setJob(response.data);
      setLoading(false);
    })();
  }, []);

  const startInspection = async () => {
    if (job?.status !== JobStatus.WORK_ORDER) {
      return;
    }
    const response = await clientApi.put(`/jobs?jobNumber=${jobNumber}`);
    if (response.status !== 200) {
      toast({
        title: response.data.message || "Invalid request",
        status: "error",
        duration: 4000,
      });
      return;
    }
    setJob({ ...job, status: JobStatus.IN_PROGRESS });
  };

  const findPrevJob = async () => {
    const prevJob = prevJobRef.current?.value.trim();
    if (!prevJob || prevJob === "") {
      return;
    }

    if (prevJob === jobNumber) {
      return;
    }

    setSearching(true);

    const response = await clientApi.get(`/previous-job?jobNumber=${prevJob}`);
    if (response.status !== 200) {
      setOnline(true);

      const apiResponse = await inspectionApi.get(`/jobs?jobNumber=${prevJob}`);
      if (apiResponse.status !== 200) {
        toast({
          title: apiResponse.data.message,
          duration: 4000,
          status: "error",
        });
        setSearching(false);
        return;
      }

      setPreviousJob(apiResponse.data.data);
      setSearching(false);
      return;
    }

    setPreviousJob(response.data);
    setSearching(false);
  };

  // const myReport = async () => {
  //   const response = await fetch("/reports3.json");
  //   const report = await response.json();

  //   report.inspectionNotes?.forEach(async (note: string) => {
  //     const response = await clientApi.post(
  //       `/jobs/note?jobNumber=${jobNumber}`,
  //       {
  //         note,
  //       }
  //     );
  //     console.log(response);
  //   });

  //   report.inspectionItems.forEach(async (item: any) => {
  //     const category = item.itemName.split(":-")[0];
  //     const name = item.itemName.split(":-")[1];
  //     const response = await clientApi.post(
  //       `/jobs/inspection-items?jobNumber=${job?.jobNumber}`,
  //       {
  //         name,
  //         category,
  //         images: item.itemImages,
  //         note: item.itemNote,
  //         isCustom: false,
  //       }
  //     );

  //     console.log(response);
  //   });
  // };

  return (
    <PageLayout title="Job Details">
      {loading ? (
        <Loading />
      ) : (
        <>
          <Card>
            <Heading
              as="h2"
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight={"semibold"}
              color={"text.700"}
            >
              &#35;{job?.jobNumber} - {job?.category}
            </Heading>
            <Grid gap={2} mt={2}>
              <MiniDetail property="Category" value={job?.category!} />
              <MiniDetail
                property="Name on report"
                value={job!.customer!.nameOnReport}
              />
              <MiniDetail
                property="Customer name"
                value={job?.customer.name!}
              />
              <MiniDetail
                property="Customer email"
                value={job?.customer.email!}
              />
              <MiniDetail
                property="Customer phone"
                value={job?.customer.phone!}
              />
              <MiniDetail property="Date & Time" value={job?.startsAt!} />
              <MiniDetail property="Site Address" value={job?.siteAddress!} />
              <MiniDetail property="Status" value={job?.status!} />
              <MiniDetail
                property="Description"
                value={
                  job?.description && job.description !== ""
                    ? job.description
                    : "N/A"
                }
                vertical={
                  job?.description !== undefined && job.description.length > 35
                }
              />
            </Grid>
          </Card>
          <Card mt={2}>
            {job?.status === JobStatus.WORK_ORDER ? (
              <Box>
                <ButtonPrimary onClick={startInspection}>
                  Start Inspection
                </ButtonPrimary>
              </Box>
            ) : (
              <>
                <Box>
                  <Heading
                    as="h3"
                    fontSize={"xl"}
                    fontWeight={"semibold"}
                    color={"text.700"}
                  >
                    Inspection Notes
                  </Heading>
                  <MiniDetail
                    noChange
                    property="Total notes"
                    value={job?.inspectionNotes?.length || 0}
                  />
                  <Flex alignItems={"center"} gap={4} mt={2}>
                    <ButtonPrimary
                      onClick={() =>
                        navigate("./add-notes", {
                          state: job,
                        })
                      }
                      width={"200px"}
                    >
                      Add Notes
                    </ButtonPrimary>
                    <ButtonOutline
                      width={"200px"}
                      onClick={() => navigate("./all-notes")}
                    >
                      View & Edit Notes
                    </ButtonOutline>
                  </Flex>
                </Box>
                <Box mt={4}>
                  <Heading
                    as="h3"
                    fontSize={"xl"}
                    fontWeight={"semibold"}
                    color={"text.700"}
                  >
                    Previous Report Items
                  </Heading>
                  <MiniDetail
                    noChange
                    property="Items from previous report"
                    value={(job?.inspectionItems as number) || 0}
                  />
                  <ButtonPrimary onClick={onOpen}>
                    Add Other Job Items
                  </ButtonPrimary>
                </Box>
                <Box mt={4}>
                  <Heading
                    as="h3"
                    fontSize={"xl"}
                    fontWeight={"semibold"}
                    color={"text.700"}
                  >
                    New Inspection Items
                  </Heading>
                  <MiniDetail
                    noChange
                    property="Total new items form this report"
                    value={(job?.inspectionItems as number) || 0}
                  />
                  <Flex alignItems={"center"} gap={4} mt={2}>
                    <ButtonPrimary
                      width={"200px"}
                      onClick={() =>
                        navigate("./add-items", {
                          state: job,
                        })
                      }
                    >
                      Add Items
                    </ButtonPrimary>
                    <ButtonOutline
                      width={"200px"}
                      onClick={() => navigate("./all-items", { state: job })}
                    >
                      View & Edit Items
                    </ButtonOutline>
                  </Flex>
                </Box>
                <Box mt={4}>
                  <Heading
                    as="h3"
                    fontSize={"xl"}
                    fontWeight={"semibold"}
                    color={"text.700"}
                  >
                    Generate Report
                  </Heading>
                  <Flex>
                    <ButtonPrimary
                      onClick={() =>
                        navigate("./preview", {
                          state: job,
                        })
                      }
                    >
                      Generate and Preview PDF
                    </ButtonPrimary>
                  </Flex>
                </Box>
                {/* <ButtonPrimary onClick={myReport} mt={3}>
                  Dmeo repor
                </ButtonPrimary> */}
              </>
            )}
          </Card>
        </>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        size={"lg"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Find previous report / job</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormInput
              id="jobNumber"
              name="jobNumber"
              ref={prevJobRef}
              placeholder="Enter job number"
            />
            <ButtonPrimary
              mt={3}
              onClick={findPrevJob}
              isLoading={searching}
              loadingText="Searching"
            >
              Search
            </ButtonPrimary>
            {searching && online && (
              <Text>Job not found offline. Fetching from server</Text>
            )}
            {previousJob && !searching && (
              <Link
                to={`./add-previous-items/${previousJob.jobNumber}`}
                state={{ job, online, previousJob }}
              >
                <Box
                  bg={"main-bg"}
                  p={3}
                  borderRadius={"xl"}
                  shadow={"xs"}
                  border={"stroke"}
                  mt={2}
                >
                  <Box>
                    <Text
                      fontSize={"lg"}
                      fontWeight={"medium"}
                      color={"text.700"}
                    >
                      #{previousJob.jobNumber} - {previousJob.category}
                    </Text>
                    <Flex alignItems={"center"} gap={2}>
                      <Text as="span">Completed At:</Text>
                      <Text as={"span"} color={"text.500"} fontSize={"lg"}>
                        {previousJob.completedAt}
                      </Text>
                    </Flex>
                  </Box>
                  <Flex direction={"column"} color={"text.600"}>
                    <Text minW={"220px"} display={"flex"} alignItems={"center"}>
                      <UserIcon boxSize={5} /> {previousJob.customer.name}
                    </Text>
                    <Text display={"flex"} alignItems={"center"}>
                      <LocationIcon boxSize={6} /> {previousJob.siteAddress}
                    </Text>
                  </Flex>
                </Box>
              </Link>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </PageLayout>
  );
};

export default JobDetails;
