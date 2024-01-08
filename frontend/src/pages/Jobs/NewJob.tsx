import { VStack } from "@chakra-ui/react";
import Card from "../../components/Card";
import PageLayout from "../../layouts/PageLayout";
import FormInput from "../../components/FormInput";

const NewJob = () => {
  return (
    <PageLayout title="New Custom Job">
      <Card>
        <form>
          <VStack>
            <FormInput
              id="jobNumber"
              name="jobNumber"
              label="Job Number"
              isRequired
              placeholder="enter job number"
            />
          </VStack>
        </form>
      </Card>
    </PageLayout>
  );
};

export default NewJob;

// import { Box, Grid, Flex, GridItem, useToast } from "@chakra-ui/react";
// import PageLayout from "../../layouts/PageLayout";
// import FormInput from "../../components/FormInput";
// import FormSelect from "../../components/FormSelect";
// import FormTextArea from "../../components/FormTextAreaNormal";
// import ButtonPrimary from "../../components/ButtonPrimary";
// import ButtonOutline from "../../components/ButtonOutline";
// import { useNavigate } from "react-router-dom";
// import { FormEvent, FormEventHandler, useState } from "react";
// import { validateJobForm } from "../../utils/validation";
// import clientApi from "../../api/clientApi";

// const NewJob = () => {
//   const navigate = useNavigate();
//   const toast = useToast();

//   const reportType = [
//     "Pre-Slab Inspection",
//     "Post-Slab Inspection",
//     "Frame Inspection",
//     "Pre-Plaster Inspection",
//     "Lock-up Inspection",
//     "Fixing Inspection",
//     "Waterproofing Inspection",
//     "Point In Time Inspection",
//     "Handover Inspection",
//     "Maintenance Inspection",
//     "Other",
//   ];

//   const [formErrors, setFormErrors] = useState<Partial<JobDetails> | null>(
//     null
//   );

//   const [loading, setLoading] = useState(false);

//   const handleCreateJob: FormEventHandler<HTMLFormElement> = async (
//     e: FormEvent
//   ) => {
//     e.preventDefault();
//     const jobForm = e.target as HTMLFormElement;
//     const formValues = new FormData(jobForm);
//     const jobData: any = {};

//     for (const [key, value] of formValues) {
//       jobData[key] = value.toString().trim();
//     }

//     const isInvalid = validateJobForm(jobData);
//     if (isInvalid) {
//       setFormErrors(isInvalid);
//       return;
//     }

//     setFormErrors(null);
//     setLoading(true);

//     const response = await clientApi.post("/jobs/new", jobData);
//     if (response.status !== 201) {
//       toast({
//         title: response.data["message"],
//         status: "error",
//         duration: 4000,
//       });
//       setLoading(false);
//       return;
//     }

//     toast({
//       title: `Job ${response.data} created successfully`,
//       status: "success",
//       duration: 4000,
//     });

//     jobForm.reset();
//     setLoading(false);
//   };

//   return (
//     <PageLayout title="Create Custom Job">
//       <Box bg="main-bg" border="stroke" p={{ base: 2, sm: 3 }} borderRadius={5}>
//         <form onSubmit={handleCreateJob}>
//           <Grid
//             px={{ base: 1, sm: 8, md: 12 }}
//             gap={3}
//             gridTemplateColumns={{ base: "auto", xl: "1fr 1fr" }}
//           >
//             <FormInput
//               type="text"
//               name="jobNumber"
//               label="Job Number"
//               placeholder="Enter job number"
//               inputError={formErrors?.jobNumber as string}
//               required
//             />
//             <FormSelect
//               label="Job Type"
//               name="jobType"
//               options={reportType}
//               placeholder="Select a job type"
//               inputError={formErrors?.jobType}
//               required
//             />
//             <FormInput
//               type="text"
//               name="customer"
//               label="Name on the report"
//               placeholder="Enter customer name which you want on report"
//               inputError={formErrors?.customer}
//               required
//             />
//             <FormInput
//               type="email"
//               name="customerEmail"
//               label="Customer Email"
//               placeholder="Enter customer email"
//               inputError={formErrors?.customerEmail}
//             />
//             <FormInput
//               type="tel"
//               name="customerPhone"
//               label="Customer Phone"
//               placeholder="Enter customer phone"
//               inputError={formErrors?.customerPhone}
//             />
//             <FormInput
//               type="date"
//               name="date"
//               label="Date"
//               placeholder="Enter date"
//               inputError={formErrors?.date}
//               required
//             />
//             <FormInput
//               type="time"
//               name="time"
//               label="Time"
//               placeholder="Enter time"
//               required
//               inputError={formErrors?.time}
//             />
//             <FormInput
//               type="text"
//               name="siteAddress"
//               label="Site Address"
//               placeholder="Enter site address"
//               inputError={formErrors?.siteAddress}
//               required
//             />
//             <GridItem colSpan={{ base: "auto", xl: 2 }}>
//               <FormTextArea
//                 name="description"
//                 label="Job Description"
//                 placeholder="Start typing here"
//                 inputError={formErrors?.description}
//               />
//             </GridItem>
//             <Flex
//               justifyContent={{ base: "space-between", xl: "flex-start" }}
//               gap={{ lg: 4 }}
//             >
//               <ButtonPrimary
//                 minW={"200px"}
//                 type="submit"
//                 minWidth={{ lg: "200px" }}
//                 isLoading={loading}
//                 loadingText="Creating"
//               >
//                 Create Job
//               </ButtonPrimary>
//               <ButtonOutline
//                 onClick={() => {
//                   navigate(-1);
//                 }}
//               >
//                 Close
//               </ButtonOutline>
//             </Flex>
//           </Grid>
//         </form>
//       </Box>
//     </PageLayout>
//   );
// };

// export default NewJob;
