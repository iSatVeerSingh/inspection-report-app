import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import Card from "../../components/Card";
import MiniDetail from "../../components/MiniDetail";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Image,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { InspectionItem, Job } from "../../types";
import { useEffect, useRef, useState } from "react";
import clientApi from "../../api/clientApi";
import Loading from "../../components/Loading";
import ParagraphText from "../../components/ParagraphText";
import ButtonOutline from "../../components/ButtonOutline";

const ItemPreview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { state: job }: { state: Job } = useLocation();
  const [inspectionItem, setInspectionItem] = useState<InspectionItem | null>(
    null
  );
  const { uuid } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const response = await clientApi.get(
        `/jobs/inspection-items?uuid=${uuid}`
      );
      setInspectionItem(response.data);
      setLoading(false);
    })();
  }, []);

  const handleDeleteInspectionItem = async () => {
    const response = await clientApi.delete(
      `/jobs/inspection-items?uuid=${inspectionItem?.uuid}`
    );
    if (response.status !== 200) {
      toast({
        title: response.data.message || "Couldn't delete item",
        status: "error",
        duration: 4000,
      });
      return;
    }
    toast({
      title: response.data.message,
      duration: 4000,
      status: "success",
    });
    onClose();
    navigate(-1);
  };

  return (
    <PageLayout title="Item Preview">
      {loading ? (
        <Loading />
      ) : (
        <Card>
          <Heading
            as="h2"
            fontSize={"2xl"}
            fontWeight={"semibold"}
            color={"text.700"}
          >
            &#35;{job?.jobNumber} - {job?.category}
          </Heading>
          {inspectionItem ? (
            <>
              <Grid gap={2} mt={2}>
                <MiniDetail
                  property="Category"
                  value={inspectionItem.category || "Custom Item"}
                />
                <MiniDetail property="Name" value={inspectionItem.name} />
                <Box>
                  <Text
                    minW={"200px"}
                    fontSize={"xl"}
                    fontWeight={"medium"}
                    color={"text.700"}
                  >
                    Images
                  </Text>
                  <Flex wrap={"wrap"} gap={2}>
                    {(inspectionItem.images as string[]).map((img, index) => (
                      <Image
                        src={img}
                        alt={`Image for ${inspectionItem.name}`}
                        key={index}
                        maxW={"200px"}
                        maxH={"200px"}
                      />
                    ))}
                  </Flex>
                </Box>
                <MiniDetail
                  vertical={
                    !!inspectionItem.note && inspectionItem.note.length > 30
                  }
                  property="Note"
                  value={inspectionItem.note || "N/A"}
                />
                <Flex direction={"column"}>
                  <Text
                    minW={"200px"}
                    fontSize={"xl"}
                    fontWeight={"medium"}
                    color={"text.700"}
                  >
                    Opening Paragraph
                  </Text>
                  <Box
                    color={"text.600"}
                    bg={"primary.50"}
                    px={3}
                    borderRadius={3}
                  >
                    <ParagraphText
                      paragraph={inspectionItem.openingParagraph!}
                    />
                  </Box>
                </Flex>
                {inspectionItem.embeddedImage && (
                  <Flex direction={"column"}>
                    <Text
                      minW={"200px"}
                      fontSize={"xl"}
                      fontWeight={"medium"}
                      color={"text.700"}
                    >
                      Embedded Image
                    </Text>
                    <Box>
                      <Image
                        src={inspectionItem.embeddedImage! as string}
                        maxW={"250px"}
                        alt={`Embedded image for ${inspectionItem.name}`}
                      />
                    </Box>
                  </Flex>
                )}
                <Flex direction={"column"}>
                  <Text
                    minW={"200px"}
                    fontSize={"xl"}
                    fontWeight={"medium"}
                    color={"text.700"}
                  >
                    Closing Paragraph
                  </Text>
                  <Box
                    color={"text.600"}
                    bg={"primary.50"}
                    px={3}
                    borderRadius={3}
                  >
                    <ParagraphText
                      paragraph={inspectionItem.closingParagraph!}
                    />
                  </Box>
                </Flex>
              </Grid>
              <Button colorScheme="red" mt={2} onClick={onOpen}>
                Delete Item
              </Button>
            </>
          ) : (
            "No item found"
          )}
        </Card>
      )}
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Inspection Item</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button colorScheme="red" onClick={handleDeleteInspectionItem}>
                Yes, Delete
              </Button>
              <ButtonOutline ref={cancelRef} onClick={onClose}>
                Cancel
              </ButtonOutline>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PageLayout>
  );
};

export default ItemPreview;

// import {
//   AlertDialog,
//   AlertDialogBody,
//   AlertDialogContent,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogOverlay,
//   Box,
//   Button,
//   Flex,
//   Heading,
//   Image,
//   Text,
//   useDisclosure,
//   useToast,
// } from "@chakra-ui/react";
// import PageLayout from "../../Layout/PageLayout";
// import MiniDetail from "../../components/MiniDetail";
// import ButtonPrimary from "../../components/ButtonPrimary";
// import { useNavigate, useParams } from "react-router-dom";
// import { useContext, useEffect, useRef, useState } from "react";
// import { InspectionItemContext } from "../../Layout/InspectionItemLayout";
// import ButtonOutline from "../../components/ButtonOutline";
// import clientApi from "../../services/clientApi";
// import { Paragraph } from "../../types";
// import { getItemPargarph } from "../../utils/itemParagraph";

// const ItemPreview = () => {
//   const params = useParams();
//   const navigate = useNavigate();
//   const toast = useToast();
//   const { inspection } = useContext(InspectionItemContext);
//   const { isOpen, onOpen, onClose } = useDisclosure();
//   const [openingParagraph, setOpeningParagraph] = useState<
//     Paragraph[] | string
//   >("");
//   const [closingParagraph, setClosingParagraph] = useState<
//     Paragraph[] | string
//   >("");

//   const inspectionItem =
//     inspection?.inspectionItems?.find((item) => item.id === params.itemId) ||
//     null;

//   useEffect(() => {
//     if (!inspection || !inspectionItem) {
//       navigate(-1);
//     } else {
//       setOpeningParagraph(getItemPargarph(inspectionItem.openingParagraph));
//       setClosingParagraph(getItemPargarph(inspectionItem.closingParagraph));
//     }
//   }, []);

//   const cancelRef = useRef<HTMLButtonElement | null>(null);
//   const [deleting, setDeleting] = useState(false);

//   const deleteInspectionItem = async () => {
//     setDeleting(true);
//     const response = await clientApi.delete(
//       `/inspections/items?inspectionId=${params.inspectionId}&itemId=${inspectionItem?.id}`
//     );

//     if (response.status !== 200) {
//       toast({
//         title: "Could not delete item",
//         status: "error",
//         duration: 4000,
//       });
//       setDeleting(false);
//       onClose();
//       return;
//     }

//     toast({
//       title: "Item deleted successfully",
//       duration: 4000,
//       status: "success",
//     });
//     setDeleting(false);
//     onClose();
//     navigate(-1);
//   };

//   return (
//     <PageLayout title="Item Preview">
//       {inspection && inspectionItem ? (
//         <Box bg="main-bg" border="stroke" borderRadius={5} p="3">
//           <Box>
//             <Heading fontSize={"2xl"} fontWeight={"medium"}>
//               &#35;{inspection?.jobNumber} - {inspection?.jobType}
//             </Heading>
//             <Text>{inspection?.siteAddress}</Text>
//           </Box>
//           <Flex direction={"column"} mt={4} gap={1}>
//             <MiniDetail property="Category" value={inspectionItem?.category} />
//             <MiniDetail property="Name" value={inspectionItem?.name} />
//             <MiniDetail
//               vertical
//               property="Summary"
//               value={inspectionItem?.summary || "No Summary"}
//             />
//             <Box>
//               <Text
//                 minW={"200px"}
//                 fontSize={"xl"}
//                 fontWeight={"medium"}
//                 color={"rich-black"}
//               >
//                 Images
//               </Text>
//               <Flex flexWrap={"wrap"} w={"full"} gap={2}>
//                 {inspectionItem?.images?.map((image: string, index: number) => (
//                   <Image key={index} src={image} maxW={"200px"} />
//                 ))}
//               </Flex>
//             </Box>
//             <MiniDetail
//               property="Notes"
//               value={inspectionItem?.note || "N/A"}
//               vertical
//             />
//             {typeof openingParagraph === "string" ? (
//               <MiniDetail
//                 property="Opening Paragraph"
//                 value={openingParagraph}
//                 vertical
//               />
//             ) : (
//               <Box>
//                 <Text
//                   minW={"200px"}
//                   fontSize={"xl"}
//                   fontWeight={"medium"}
//                   color={"rich-black"}
//                 >
//                   Opening Paragraph
//                 </Text>
//                 <Box>
//                   {openingParagraph.map((paragraph, index) => (
//                     <Text
//                       key={index}
//                       bg="text-bg"
//                       px={3}
//                       borderRadius={3}
//                       color={"main-text"}
//                     >
//                       {paragraph.text.map((text, index) => (
//                         <Text
//                           as="span"
//                           key={index}
//                           fontWeight={text.bold ? "bold" : "normal"}
//                           fontStyle={text.italics ? "italic" : "normal"}
//                           textDecoration={
//                             text.decoration
//                               ? typeof text.decoration === "string"
//                                 ? text.decoration
//                                 : "underline line-through"
//                               : "none"
//                           }
//                         >
//                           {text.text}
//                         </Text>
//                       ))}
//                     </Text>
//                   ))}
//                 </Box>
//               </Box>
//             )}
//             {inspectionItem.embeddedImage && (
//               <Box>
//                 <Text
//                   minW={"200px"}
//                   fontSize={"xl"}
//                   fontWeight={"medium"}
//                   color={"rich-black"}
//                 >
//                   Embedded Image
//                 </Text>
//                 <Image src={inspectionItem.embeddedImage} maxW={"200px"} />
//               </Box>
//             )}
//             {typeof closingParagraph === "string" ? (
//               <MiniDetail
//                 property="Opening Paragraph"
//                 value={closingParagraph}
//                 vertical
//               />
//             ) : (
//               <Box>
//                 <Text
//                   minW={"200px"}
//                   fontSize={"xl"}
//                   fontWeight={"medium"}
//                   color={"rich-black"}
//                 >
//                   Closing Paragraph
//                 </Text>
//                 <Box>
//                   {closingParagraph.map((paragraph, index) => (
//                     <Text
//                       key={index}
//                       bg="text-bg"
//                       px={3}
//                       borderRadius={3}
//                       color={"main-text"}
//                     >
//                       {paragraph.text.map((text, index) => (
//                         <Text
//                           as="span"
//                           key={index}
//                           fontWeight={text.bold ? "bold" : "normal"}
//                           fontStyle={text.italics ? "italic" : "normal"}
//                           textDecoration={
//                             text.decoration
//                               ? typeof text.decoration === "string"
//                                 ? text.decoration
//                                 : "underline line-through"
//                               : "none"
//                           }
//                         >
//                           {text.text}
//                         </Text>
//                       ))}
//                     </Text>
//                   ))}
//                 </Box>
//               </Box>
//             )}
//           </Flex>
//           <Flex justifyContent={"space-between"} mt={5}>
//             <ButtonPrimary width={"200px"} onClick={() => navigate(-1)}>
//               Close
//             </ButtonPrimary>
//             <ButtonOutline colorScheme="red" onClick={onOpen}>
//               Delete Item
//             </ButtonOutline>
//           </Flex>
//         </Box>
//       ) : (
//         <Text>Item Not Found</Text>
//       )}
//       <AlertDialog
//         isOpen={isOpen}
//         leastDestructiveRef={cancelRef}
//         onClose={onClose}
//         closeOnOverlayClick={false}
//       >
//         <AlertDialogOverlay>
//           <AlertDialogContent>
//             <AlertDialogHeader fontSize="lg" fontWeight="bold">
//               Delete {inspectionItem?.name}
//             </AlertDialogHeader>

//             <AlertDialogBody>
//               Are you sure? You can't undo this action afterwards.
//             </AlertDialogBody>

//             <AlertDialogFooter>
//               <Button ref={cancelRef} onClick={onClose}>
//                 Cancel
//               </Button>
//               <Button
//                 colorScheme="red"
//                 onClick={deleteInspectionItem}
//                 ml={3}
//                 isLoading={deleting}
//                 loadingText="Deleting"
//               >
//                 Delete
//               </Button>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialogOverlay>
//       </AlertDialog>
//     </PageLayout>
//   );
// };

// export default ItemPreview;
