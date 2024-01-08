import { Box, Grid, Heading, Text, Textarea, useToast } from "@chakra-ui/react";
import PageLayout from "../../layouts/PageLayout";
import { useEffect, useRef, useState } from "react";
import clientApi from "../../api/clientApi";
import { useLocation, useParams } from "react-router-dom";
import { Job, InspectionNote } from "../../types";
import MiniDetail from "../../components/MiniDetail";
import DatalistInput from "../../components/DatalistInput";
import ButtonPrimary from "../../components/ButtonPrimary";
import Card from "../../components/Card";

const AddInspectionNotes = () => {
  const { state: job }: { state: Job } = useLocation();

  const { jobNumber } = useParams();
  const toast = useToast();
  const [libraryNotes, setLibraryNotes] = useState<string[]>([]);
  const commonNoteRef = useRef<HTMLInputElement>(null);
  const customNoteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    (async () => {
      const response = await clientApi.get("/inspection-notes");
      if (response.status !== 200) {
        return;
      }
      const notes = (response.data as InspectionNote[]).map(
        (note) => note.text
      );
      setLibraryNotes(notes);
    })();
  }, []);

  const addInspectionNote = async (note: string) => {
    const response = await clientApi.post(`/jobs/note?jobNumber=${jobNumber}`, {
      note,
    });
    if (response.status !== 200) {
      toast({
        title: response.data.message,
        duration: 4000,
        status: "error",
      });
      return;
    }
    toast({
      title: response.data.message,
      duration: 4000,
      status: "success",
    });
    commonNoteRef.current!.value = "";
    customNoteRef.current!.value = "";
  };

  const handleAddCommonNote = async () => {
    const note = commonNoteRef.current?.value.trim();
    if (note && note === "") {
      return;
    }
    await addInspectionNote(note!);
  };

  const handleAddCustomNote = async () => {
    const note = customNoteRef.current?.value.trim();
    if (note && note === "") {
      return;
    }
    await addInspectionNote(note!);
  };

  return (
    <PageLayout title="Add Inspection Notes">
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
          <DatalistInput
            label="Choose from a list of common notes"
            dataList={libraryNotes}
            ref={commonNoteRef}
          />
          <ButtonPrimary mt={2} w={"250px"} onClick={handleAddCommonNote}>
            Add Note
          </ButtonPrimary>
        </Box>
        <Box mt={4} fontSize={"2xl"} textAlign={"center"}>
          OR
        </Box>
        <Box mt={4}>
          <Text color={"text.700"}>
            If you have not found any relevant note in common list you can
            custom note.
          </Text>
          <Textarea
            bg={"neutral.50"}
            border={"stroke"}
            borderRadius={"xl"}
            ref={customNoteRef}
            placeholder="type here"
          />
          <ButtonPrimary mt={2} w={"250px"} onClick={handleAddCustomNote}>
            Add Custom Note
          </ButtonPrimary>
        </Box>
      </Card>
    </PageLayout>
  );
};

export default AddInspectionNotes;
