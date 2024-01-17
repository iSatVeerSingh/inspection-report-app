import { Box, Grid, Heading } from "@chakra-ui/react";
import Card from "../../components/Card";
import PageLayout from "../../layouts/PageLayout";
import MiniDetail from "../../components/MiniDetail";
import { useLocation } from "react-router-dom";
import { InspectionItem, Job } from "../../types";
import { useEffect, useState } from "react";
import { inspectionApi } from "../../api";
import Loading from "../../components/Loading";

const AddItemsPreviousJob = () => {
  const { state }: any = useLocation();
  const {
    job,
    online,
    previousJob,
  }: { job: Job; online: boolean; previousJob: Job } = state;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InspectionItem[]>([]);

  useEffect(() => {
    (async () => {
      if (online) {
        const response = await inspectionApi.get(
          `/jobs/${previousJob.id}?items=true`
        );
        if (response.status !== 200) {
          setLoading(false);
          return;
        }
        setItems(response.data?.data?.inspectionItems);
        setLoading(false)
        console.log(response.data);
      }
    })();
  });

  return (
    <PageLayout title="Add Items From Previous Job">
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
          <MiniDetail property="Site Address" value={job?.siteAddress!} />
          <MiniDetail
            property="Previous Job"
            value={`${previousJob.jobNumber} - ${previousJob.category}`}
          />
        </Grid>
      </Card>
      {loading ? (
        <Loading />
      ) : (
        <Box mt={2}>
          {items.length !== 0 ? (
            <Grid gap={2}>
              {items.map((item) => (
                <Card>{item.name}</Card>
              ))}
            </Grid>
          ) : (
            <Card>No Items Found</Card>
          )}
        </Box>
      )}
    </PageLayout>
  );
};

export default AddItemsPreviousJob;

// import { Link, useLocation, useParams } from "react-router-dom";
// import Card from "../../components/Card";
// import PageLayout from "../../layouts/PageLayout";
// import { InspectionItem, Job } from "../../types";
// import { useEffect, useRef, useState } from "react";
// import clientApi from "../../api/clientApi";
// import {
//   Box,
//   Flex,
//   Grid,
//   Heading,
//   Modal,
//   ModalBody,
//   ModalCloseButton,
//   ModalContent,
//   ModalFooter,
//   ModalHeader,
//   ModalOverlay,
//   Text,
//   useDisclosure,
// } from "@chakra-ui/react";
// import MiniDetail from "../../components/MiniDetail";
// import ButtonOutline from "../../components/ButtonOutline";
// import FileInput from "../../components/FileInput";
// import ButtonPrimary from "../../components/ButtonPrimary";
// import { getResizedImagesBase64Main } from "../../utils/resize";

// const AddItemsPreviousJob = () => {
//   const { prevJob } = useParams();
//   const {
//     state: { job, online, previousJob },
//   }: { state: { job: Job; online: boolean; previousJob: Job } } = useLocation();
//   const [previousItems, setPreviousItems] = useState<InspectionItem[]>([]);
//   const [loading, setLoading] = useState(false);
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const itemRef = useRef<InspectionItem | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     (async () => {
//       if (!online) {
//         const prevJobResponse = await clientApi.get(
//           `/previous-job/items?jobNumber=${prevJob}`
//         );
//         setPreviousItems(prevJobResponse.data.items);
//       }
//     })();
//   }, []);

//   const handleAddItemButton = (item: InspectionItem) => {
//     itemRef.current = item;
//     onOpen();
//   };

//   const addPreviousItem = async (addImages?: boolean) => {
//     const imageFiles = fileInputRef.current?.files;
//     if (!imageFiles || imageFiles.length === 0) {
//       return;
//     }

//     const resizedImages = await getResizedImagesBase64Main(imageFiles);

//     console.log(resizedImages);
//   };

//   return (
//     <PageLayout title="Add Items From Previous Job">
//       <Card>
//         <Heading
//           as="h2"
//           fontSize={{ base: "xl", md: "2xl" }}
//           fontWeight={"semibold"}
//           color={"text.700"}
//         >
//           &#35;{job?.jobNumber} - {job?.category}
//         </Heading>
//         <Grid gap={2} mt={2}>
//           <MiniDetail property="Category" value={job?.category!} />
//           <MiniDetail property="Site Address" value={job?.siteAddress!} />
//           <MiniDetail
//             property="Previous Job"
//             value={`${previousJob.jobNumber} - ${previousJob.category}`}
//           />
//         </Grid>
//       </Card>
//       <Grid gap={2} mt={2}>
//         {previousItems.length !== 0
//           ? previousItems.map((item) => (
//               <Flex
//                 bg={"main-bg"}
//                 p={3}
//                 borderRadius={"xl"}
//                 shadow={"xs"}
//                 gap={3}
//                 key={item.uuid}
//               >
//                 <Box flexGrow={1}>
//                   <Link to={"./" + item.uuid} state={job}>
//                     <Flex
//                       alignItems={"center"}
//                       justifyContent={"space-between"}
//                     >
//                       <Text
//                         fontSize={"xl"}
//                         fontWeight={"medium"}
//                         color={"text.700"}
//                       >
//                         {item.category || "Custom Item"}:- {item.name}
//                       </Text>
//                       <Text>Images:- {item.images?.length}</Text>
//                     </Flex>
//                     <Text>
//                       Note:-
//                       <Text as="span" color={"text.500"}>
//                         {item.note || "N/A"}
//                       </Text>
//                     </Text>
//                   </Link>
//                 </Box>
//                 <ButtonOutline onClick={() => handleAddItemButton(item)}>
//                   Add
//                 </ButtonOutline>
//               </Flex>
//             ))
//           : "No Items found"}
//       </Grid>
//       <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
//         <ModalOverlay />
//         <ModalContent>
//           <ModalHeader>Add Images</ModalHeader>
//           <ModalCloseButton />
//           <ModalBody>
//             <FileInput
//               name="images"
//               accept=".jpg, .png, .jpeg"
//               multiple
//               ref={fileInputRef}
//             />
//           </ModalBody>
//           <ModalFooter gap={2} justifyContent={"start"}>
//             <ButtonPrimary onClick={addPreviousItem}>Add Images</ButtonPrimary>
//             <ButtonOutline>Skip, Don't add images</ButtonOutline>
//           </ModalFooter>
//         </ModalContent>
//       </Modal>
//     </PageLayout>
//   );
// };

// export default AddItemsPreviousJob;
