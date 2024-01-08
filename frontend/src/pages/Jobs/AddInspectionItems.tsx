import { useLocation, useNavigate } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import Card from "../../components/Card";
import { InspectionItem, InspectionItemForm, Job } from "../../types";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import MiniDetail from "../../components/MiniDetail";
import FormSelect from "../../components/FormSelect";
import {
  ChangeEventHandler,
  FormEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import clientApi from "../../api/clientApi";
import Loading from "../../components/Loading";
import DatalistInput from "../../components/DatalistInput";
import FileInput from "../../components/FileInput";
import FormTextArea from "../../components/FormTextArea";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOutline from "../../components/ButtonOutline";
import { getResizedImagesBase64Main } from "../../utils/resize";
import FormInput from "../../components/FormInput";

const AddInspectionItems = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { state: job }: { state: Job } = useLocation();
  const [categories, setCategories] = useState<string[]>([]);
  const [libraryItems, setLibraryItems] = useState<
    { name: string; category: string }[]
  >([]);

  const [itemNames, setItemNames] = useState<string[]>([]);
  const datalistRef = useRef<HTMLInputElement>(null);

  const [formErrors, setFormErrors] = useState<Partial<InspectionItem> | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    (async () => {
      const response = await clientApi.get("/library-index");
      if (response.status !== 200) {
        setLoading(false);
        return;
      }
      setCategories(response.data.categories);
      setLibraryItems(response.data.libraryItems);
      setLoading(false);
    })();
  }, []);

  const filterItemNames: ChangeEventHandler<HTMLSelectElement> &
    FormEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    const target = e.target as HTMLSelectElement;

    datalistRef!.current!.value = "";
    const filteredNames = libraryItems
      .filter((item) => item.category === target.value)
      .map((item) => item.name);

    setItemNames(filteredNames);
  };

  const onSubmitItemForm: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const itemData: Partial<InspectionItem> = {
      category: formData.get("category")?.toString().trim()!,
      name: formData.get("name")?.toString().trim()!,
      images: formData.getAll("images") as File[],
      note: formData.get("note")?.toString().trim(),
    };

    const errors: Partial<InspectionItemForm> = {};
    if (itemData.category === "") {
      errors.category = "Please select a category";
    }
    if (itemData.name === "") {
      errors.name = "Please choose a name";
    }

    if (itemData.images!.length === 0) {
      errors.images = "Please select atleast one image";
    }

    if (itemData.images!.length > 8) {
      errors.images = "Max 8 images allowed";
    }

    if (itemData.note!.length > 200) {
      errors.note = "Note should be max 200 characters";
    }

    if (Object.keys(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors(null);
    setSaving(true);

    const resizedImages = await getResizedImagesBase64Main(
      itemData.images as File[]
    );

    itemData.images = resizedImages;
    itemData.isCustom = false;

    const response = await clientApi.post(
      `/jobs/inspection-items?jobNumber=${job.jobNumber}`,
      itemData
    );
    if (response.status !== 200) {
      toast({
        title: response.data.message,
        duration: 4000,
        status: "error",
      });
      setSaving(false);
      return;
    }

    toast({
      title: response.data.message,
      status: "success",
      duration: 4000,
    });
    setSaving(false);

    target.reset();
  };

  const onSubmitCustomItemForm: FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const itemData: Partial<InspectionItem> = {
      name: formData.get("name")?.toString().trim()!,
      images: formData.getAll("images") as File[],
      openingParagraph: formData.get("openingParagraph")?.toString().trim(),
      closingParagraph: formData.get("closingParagraph")?.toString().trim(),
      note: formData.get("note")?.toString().trim(),
      embeddedImage: formData.get("embeddedImage") as File,
    };

    const errors: Partial<InspectionItem> = {};
    if (itemData.name === "") {
      errors.name = "Please choose a name";
    }

    if (itemData.images!.length === 0) {
      errors.images = "Please select atleast one image";
    }

    if (itemData.images!.length > 8) {
      errors.images = "Max 8 images allowed";
    }

    if (itemData.openingParagraph === "") {
      errors.openingParagraph = "Opening paragraph is required";
    }

    if (itemData.closingParagraph === "") {
      errors.closingParagraph = "Closing paragraph is required";
    }

    if (itemData.note!.length > 200) {
      errors.note = "Note should be max 200 characters";
    }

    if (Object.keys(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors(null);
    setSaving(true);

    const resizedImages = await getResizedImagesBase64Main(
      itemData.images as File[]
    );

    itemData.images = resizedImages;

    if ((itemData.embeddedImage as File).size > 0) {
      const resizedEmbeddedImage = await getResizedImagesBase64Main([
        itemData.embeddedImage as File,
      ]);
      itemData.embeddedImage = resizedEmbeddedImage[0];
    } else {
      itemData.embeddedImage = undefined;
    }

    itemData.isCustom = true;

    const response = await clientApi.post(
      `/jobs/inspection-items?jobNumber=${job.jobNumber}`,
      itemData
    );
    if (response.status !== 200) {
      toast({
        title: response.data.message,
        duration: 4000,
        status: "error",
      });
      setSaving(false);
      return;
    }

    toast({
      title: response.data.message,
      status: "success",
      duration: 4000,
    });
    setSaving(false);

    target.reset();
  };

  return (
    <PageLayout
      title="Add Inspection Items"
      btn="Add Custom Item"
      onClick={onOpen}
    >
      {loading ? (
        <Loading />
      ) : (
        <Card>
          <Heading
            as="h2"
            fontSize={{ base: "xl", sm: "2xl" }}
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
          <Box mt={4}>
            <form onSubmit={onSubmitItemForm}>
              <VStack>
                <FormSelect
                  options={categories}
                  isRequired
                  label="Category"
                  id="category"
                  name="category"
                  placeholder="Select a category"
                  onChange={filterItemNames}
                  inputError={formErrors?.category}
                />
                <DatalistInput
                  dataList={itemNames}
                  isRequired
                  label="Name"
                  id="name"
                  name="name"
                  placeholder="type here name"
                  ref={datalistRef}
                  inputError={formErrors?.name}
                />
                <FileInput
                  isRequired
                  label="Images"
                  subLabel="Max (8)"
                  id="images"
                  name="images"
                  multiple
                  accept=".jpeg, .jpg, .png"
                  inputError={formErrors?.images as string}
                />
                <FormTextArea
                  label="Note"
                  subLabel="Optional"
                  id="note"
                  name="note"
                  placeholder="type note here"
                  inputError={formErrors?.note!}
                />
              </VStack>
              <Flex mt={2} gap={3}>
                <ButtonPrimary
                  w={"200px"}
                  type="submit"
                  isLoading={saving}
                  loadingText="Adding"
                >
                  Add Item
                </ButtonPrimary>
                <ButtonOutline onClick={() => navigate(-1)}>
                  Cancel
                </ButtonOutline>
              </Flex>
            </form>
          </Box>
        </Card>
      )}
      <Modal isOpen={isOpen} onClose={onClose} size={"2xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Custom Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={onSubmitCustomItemForm} id="custom_item">
              <VStack>
                <FormInput
                  label="Name"
                  id="name"
                  name="name"
                  placeholder="type name here"
                  isRequired
                  inputError={formErrors?.name}
                />
                <FileInput
                  isRequired
                  label="Images"
                  subLabel="Max (8)"
                  id="images"
                  name="images"
                  multiple
                  accept=".jpeg, .jpg, .png"
                  inputError={formErrors?.images as string}
                />
                <FormTextArea
                  isRequired
                  label="Opening Paragraph"
                  id="openingParagraph"
                  name="openingParagraph"
                  placeholder="type here"
                  inputError={formErrors?.openingParagraph}
                />
                <FileInput
                  label="Embedded Image"
                  subLabel="Optional"
                  id="embeddedImage"
                  name="embeddedImage"
                  accept=".jpeg, .jpg, .png"
                />
                <FormTextArea
                  isRequired
                  label="Closing Paragraph"
                  id="closingParagraph"
                  name="closingParagraph"
                  placeholder="type here"
                  inputError={formErrors?.closingParagraph}
                />
                <FormTextArea
                  label="Note"
                  id="note"
                  name="note"
                  subLabel="Optional"
                  placeholder="type note here"
                  inputError={formErrors?.note}
                />
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter gap={3} justifyContent={"start"}>
            <ButtonPrimary
              form="custom_item"
              type="submit"
              w={"200px"}
              isLoading={saving}
              loadingText="Adding"
            >
              Add Item
            </ButtonPrimary>
            <ButtonOutline onClick={onClose}>Cancel</ButtonOutline>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  );
};

export default AddInspectionItems;
