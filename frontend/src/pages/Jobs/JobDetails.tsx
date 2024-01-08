import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import Card from "../../components/Card";
import { useEffect, useState } from "react";
import clientApi from "../../api/clientApi";
import { Job, JobStatus } from "../../types";
import Loading from "../../components/Loading";
import { Box, Flex, Grid, Heading, useToast } from "@chakra-ui/react";
import MiniDetail from "../../components/MiniDetail";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOutline from "../../components/ButtonOutline";

const JobDetails = () => {
  const { jobNumber } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const toast = useToast();

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

  // const myReport = async () => {
  //   const response = await fetch("/reports2.json");
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
              <MiniDetail property="Date" value={job?.startsAt!} />
              <MiniDetail property="Time" value={job?.startTime!} />
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
    </PageLayout>
  );
};

export default JobDetails;
