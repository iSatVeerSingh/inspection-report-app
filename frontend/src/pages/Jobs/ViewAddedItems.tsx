import { useEffect, useState } from "react";
import PageLayout from "../../layouts/PageLayout";
import Card from "../../components/Card";
import clientApi from "../../api/clientApi";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { InspectionItem, Job } from "../../types";
import Loading from "../../components/Loading";
import { Box, Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import MiniDetail from "../../components/MiniDetail";
import FilterSelect from "../../components/FilterSelect";
import ButtonOutline from "../../components/ButtonOutline";

const ViewAddedItems = () => {
  const { jobNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [inspectionItems, setInspectionItems] = useState<InspectionItem[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [libraryItemCategories, setLibraryItemCategories] = useState<string[]>(
    []
  );
  const [pages, setPages] = useState<{ pages: number; currentPage: number }>();

  useEffect(() => {
    (async () => {
      const jobresponse = await clientApi.get(`/jobs?jobNumber=${jobNumber}`);
      if (jobresponse.status !== 200) {
        return;
      }
      setJob(jobresponse.data);
      const response = await clientApi.get("/library-item-categories");
      if (response.status !== 200) {
        return;
      }
      const allCategories = await response.data.map(
        (category: any) => category.name
      );
      setLibraryItemCategories(allCategories);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const searchUrl =
        searchParams.size === 0
          ? `/jobs/inspection-items?jobNumber=${jobNumber}`
          : `/jobs/inspection-items?jobNumber=${jobNumber}&${searchParams.toString()}`;
      const response = await clientApi.get(searchUrl);

      if (response.status !== 200) {
        setLoading(false);
        return;
      }
      setInspectionItems(response.data.items);
      setPages({
        pages: response.data.pages,
        currentPage: response.data.currentPage,
      });
      setLoading(false);
    })();
  }, [searchParams]);

  const updateSearch = (key: any, value: string) => {
    if (value && value !== "") {
      console.log(key, value);
      setSearchParams((prev) => ({
        ...Object.fromEntries(prev),
        [key]: value,
      }));
    }
  };

  const clearFilter = () => {
    setSearchParams({});
  };

  return (
    <PageLayout title="All Added Items" backPage={`/jobs/${jobNumber}`}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Card>
            <Heading
              as="h2"
              fontSize={"2xl"}
              fontWeight={"semibold"}
              color={"text.700"}
            >
              &#35;{job?.jobNumber} - {job?.category}
            </Heading>
            <Grid gap={2} mt={2}>
              <MiniDetail property="Category" value={job?.category!} />
              <MiniDetail
                property="Customer"
                value={job?.customer!.nameOnReport!}
              />
              <MiniDetail property="Site Address" value={job?.siteAddress!} />
            </Grid>
          </Card>
          <Flex
            direction={{ base: "column", lg: "row" }}
            alignItems={{ base: "start", lg: "center" }}
            gap={2}
            mt={2}
          >
            <Flex gap={3} alignItems={"center"}>
              <Text>Filter</Text>
              <FilterSelect
                options={["Custom", ...libraryItemCategories]}
                value={searchParams.get("category") || ""}
                placeholder="Select a category"
                onChange={(e) => updateSearch("category", e.target.value)}
              />
            </Flex>
            <ButtonOutline size={"sm"} onClick={clearFilter}>
              Clear
            </ButtonOutline>
          </Flex>
          {inspectionItems.length === 0 ? (
            <Card mt={3}>Couldn't find any items</Card>
          ) : (
            <>
              <Grid mt={3} gap={2}>
                {inspectionItems.map((item) => (
                  <Link to={"./" + item.uuid} key={item.uuid} state={job}>
                    <Box bg={"main-bg"} p={3} borderRadius={"xl"} shadow={"xs"}>
                      <Flex
                        alignItems={"center"}
                        justifyContent={"space-between"}
                      >
                        <Text
                          fontSize={"xl"}
                          fontWeight={"medium"}
                          color={"text.700"}
                        >
                          {item.category || "Custom Item"}:- {item.name}
                        </Text>
                        <Text>Images:- {item.images?.length}</Text>
                      </Flex>
                      <Text>
                        Note:-
                        <Text as="span" color={"text.500"}>
                          {item.note || "N/A"}
                        </Text>
                      </Text>
                    </Box>
                  </Link>
                ))}
              </Grid>
              {pages && inspectionItems.length !== 0 && (
                <Flex
                  mt={4}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                >
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
        </>
      )}
    </PageLayout>
  );
};

export default ViewAddedItems;

// import { Box, Flex, Heading, Text, Grid } from "@chakra-ui/react";
// import PageLayout from "../../Layout/PageLayout";
// import { Link, useParams } from "react-router-dom";
// import { useContext, useEffect, useState } from "react";
// import clientApi from "../../services/clientApi";
// import Loading from "../../components/Loading";
// import { InspectionItemContext } from "../../Layout/InspectionItemLayout";

// const AllAddedItems = () => {
//   const params = useParams();
//   const [loading, setLoading] = useState(true);
//   const { inspection, setInspection } = useContext(InspectionItemContext);

//   useEffect(() => {
//     const getInspection = async () => {
//       const response = await clientApi.get(
//         `/inspections?inspectionId=${params.inspectionId}`
//       );

//       if (response.status !== 200) {
//         setLoading(false);
//         return;
//       }

//       setInspection(response.data);
//       setLoading(false);
//     };

//     getInspection();
//   }, []);

//   return (
//     <PageLayout title="Newly added items">
//       {loading ? (
//         <Loading />
//       ) : (
//         <Box>
//           <Box>
//             <Heading
//               fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
//               fontWeight={"medium"}
//               color={"rich-black"}
//             >
//               &#35;{inspection?.jobNumber} - {inspection?.jobType}
//             </Heading>
//             <Text fontSize={"lg"} color={"dark-gray"}>
//               {inspection?.siteAddress}
//             </Text>
//           </Box>
//           {inspection?.inspectionItems &&
//           inspection.inspectionItems.length !== 0 ? (
//             <Grid mt={4} gap={2}>
//               {inspection.inspectionItems.map((item) => (
//                 <Link to={"./" + item.id} key={item.id}>
//                   <Box bg={"main-bg"} p={2} borderRadius={5}>
//                     <Flex
//                       alignItems={"center"}
//                       justifyContent={"space-between"}
//                       w={"full"}
//                     >
//                       <Text
//                         fontSize={"lg"}
//                         color={"rich-black"}
//                         fontWeight={"semibold"}
//                       >
//                         {item.category} :- {item.name}
//                       </Text>
//                       <Text>({item.images?.length}) Images</Text>
//                     </Flex>
//                     <Text color={"main-text"}>Note:- {item.note || "N/A"}</Text>
//                   </Box>
//                 </Link>
//               ))}
//             </Grid>
//           ) : (
//             <Box mt={3} bg="main-bg" p="3" borderRadius={5}>
//               <Text>No Items Found</Text>
//             </Box>
//           )}
//         </Box>
//       )}
//     </PageLayout>
//   );
// };

// export default AllAddedItems;
