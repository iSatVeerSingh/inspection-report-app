import {
  Flex,
  Grid,
  Heading,
  IconButton,
  Text,
  useToast,
} from "@chakra-ui/react";
import PageLayout from "../../layouts/PageLayout";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Job } from "../../types";
import clientApi from "../../api/clientApi";
import MiniDetail from "../../components/MiniDetail";
import { DeleteIcon } from "../../icons";
import Card from "../../components/Card";

const ViewAddedNotes = () => {
  const { jobNumber } = useParams();
  const toast = useToast();
  const [job, setJob] = useState<Job | null>(null);

  const getJob = async () => {
    const response = await clientApi.get(`/jobs?jobNumber=${jobNumber}`);
    if (response.status !== 200) {
      return;
    }
    setJob(response.data);
  };

  useEffect(() => {
    getJob();
  }, []);

  const deleteNote = async (note: string) => {
    const response = await clientApi.put(`/jobs/note?jobNumber=${jobNumber}`, {
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
    await getJob();
  };

  return (
    <PageLayout title="All Notes">
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
      {job?.inspectionNotes && job.inspectionNotes.length !== 0 ? (
        <Grid gap={2} mt={3}>
          {job.inspectionNotes.map((note, index) => (
            <Flex
              key={index}
              p={2}
              borderRadius={"xl"}
              shadow={"xs"}
              bg={"main-bg"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <Text color={"text.700"}>{note}</Text>
              <IconButton
                icon={<DeleteIcon />}
                aria-label="Delete Note"
                onClick={() => deleteNote(note)}
              />
            </Flex>
          ))}
        </Grid>
      ) : (
        <Card color={"text.700"} mt={2}>
          Couldn't find any notes
        </Card>
      )}
    </PageLayout>
  );
};

export default ViewAddedNotes;
