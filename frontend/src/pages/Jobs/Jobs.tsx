import { Link, useSearchParams } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import { Box, Button, Flex, Grid, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import FilterSelect from "../../components/FilterSelect";
import clientApi from "../../api/clientApi";
import FilterInput from "../../components/FilterInput";
import ButtonOutline from "../../components/ButtonOutline";
import { Job, JobStatus } from "../../types";
import { LocationIcon, UserIcon } from "../../icons";
import Loading from "../../components/Loading";
import NoResourceFound from "../../components/NoResourceFound";

type Filter = {
  status?: string;
  category?: string;
  startsAt?: string;
  page?: string;
};

const Jobs = () => {
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobCategories, setJobCategories] = useState<string[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pages, setPages] = useState<{ pages: number; currentPage: number }>();

  const updateSearch = (key: keyof Filter, value: string) => {
    if (value && value !== "") {
      console.log(key, value);
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev),
        [key]: value,
      }));
    }
  };

  useEffect(() => {
    (async () => {
      const response = await clientApi.get("/job-categories");
      if (response.status === 200) {
        setJobCategories(response.data.map((item: any) => item.name));
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const searchUrl =
        searchParams.size === 0 ? "/jobs" : "/jobs?" + searchParams.toString();
      const response = await clientApi.get(searchUrl);
      if (response.status !== 200) {
        setLoading(false);
        return;
      }
      setJobs(response.data.data);
      setPages({
        pages: response.data.pages,
        currentPage: response.data.currentPage,
      });
      setLoading(false);
    })();
  }, [searchParams]);

  const clearFilter = () => {
    setSearchParams({});
  };

  const createNewCustomJob = () => {};

  return (
    <PageLayout
      title="All Jobs"
      isRoot
      btn="New Custom Job"
      onClick={createNewCustomJob}
    >
      {loading ? (
        <Loading />
      ) : (
        <>
          <Flex
            mx={"auto"}
            direction="row"
            alignItems="center"
            gap={2}
            justify={"center"}
          >
            <Flex gap={3} alignItems={"center"}>
              <Text>Filter</Text>
              <FilterSelect
                value={searchParams.get("status") || JobStatus.WORK_ORDER}
                options={[
                  JobStatus.WORK_ORDER,
                  JobStatus.IN_PROGRESS,
                  JobStatus.NOT_SUBMITTED,
                  JobStatus.COMPLETED,
                ]}
                onChange={(e) => updateSearch("status", e.target.value)}
              />
              <FilterSelect
                options={jobCategories}
                value={searchParams.get("category") || ""}
                placeholder="Select a category"
                onChange={(e) => updateSearch("category", e.target.value)}
              />
              <FilterInput
                value={searchParams.get("startsAt") || ""}
                onChange={(e) => updateSearch("startsAt", e.target.value)}
                type="date"
              />
            </Flex>
            <ButtonOutline size={"sm"} onClick={clearFilter}>
              Clear
            </ButtonOutline>
          </Flex>
          <Box mt={4}>
            {jobs.length === 0 ? (
              <NoResourceFound>Couldn't get any jobs</NoResourceFound>
            ) : (
              <Grid gap={2}>
                {jobs.map((job) => (
                  <Link to={"./" + job.jobNumber} key={job.id}>
                    <Box bg={"main-bg"} p={3} borderRadius={"xl"} shadow={"xs"}>
                      <Flex
                        alignItems={{ base: "start", sm: "center" }}
                        justifyContent={"space-between"}
                        direction={{ base: "column", sm: "row" }}
                      >
                        <Text
                          fontSize={"xl"}
                          fontWeight={"medium"}
                          color={"text.700"}
                        >
                          #{job.jobNumber} - {job.category}
                        </Text>
                        <Text as={"span"} color={"text.500"} fontSize={"lg"}>
                          {job.startsAt} {job.startTime}
                        </Text>
                      </Flex>
                      <Flex
                        alignItems={{ base: "start", lg: "center" }}
                        direction={{ base: "column", lg: "row" }}
                        fontSize={"lg"}
                        color={"text.600"}
                        gap={{ base: 1, lg: 3 }}
                      >
                        <Text
                          minW={"220px"}
                          display={"flex"}
                          alignItems={"center"}
                        >
                          <UserIcon boxSize={5} /> {job.customer.name}
                        </Text>
                        <Text display={"flex"} alignItems={"center"}>
                          <LocationIcon boxSize={6} /> {job.siteAddress}
                        </Text>
                      </Flex>
                      <Flex
                        alignItems={"center"}
                        justifyContent={"space-between"}
                        mt={2}
                      >
                        <Text
                          bg={"primary.50"}
                          px={4}
                          borderRadius={4}
                          color={"text.500"}
                        >
                          {job.category}
                        </Text>
                        <Text
                          bg={"app-bg"}
                          px={3}
                          borderRadius={3}
                          color={
                            job.status === "Completed"
                              ? "green.500"
                              : "orange.500"
                          }
                        >
                          {job.status}
                        </Text>
                      </Flex>
                    </Box>
                  </Link>
                ))}
              </Grid>
            )}
          </Box>
          {pages && jobs.length !== 0 && (
            <Flex mt={4} justifyContent={"space-between"} alignItems={"center"}>
              <Button
                isDisabled={pages.currentPage <= 1}
                onClick={() =>
                  updateSearch("page", (pages.currentPage - 1).toString())
                }
              >
                Prev
              </Button>
              <Text>Current Page: {pages.currentPage}</Text>
              <Button
                isDisabled={pages.currentPage >= pages.pages}
                onClick={() =>
                  updateSearch("page", (pages.currentPage + 1).toString())
                }
              >
                Next
              </Button>
            </Flex>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default Jobs;
