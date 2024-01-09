import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Center,
  Progress,
  Text,
} from "@chakra-ui/react";
import { redirect, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import { useState } from "react";
import ButtonPrimary from "../components/ButtonPrimary";
import clientApi from "../api/clientApi";
import { inspectionApi } from "../api";

export const initLoader = async () => {
  const user = localStorage.getItem("user");
  if (!user) {
    return redirect("/login");
  }

  // const response = await clientApi.get("/init-status");
  // if (response.status !== 200) {
  //   return redirect("/login");
  // }

  // if (response.data.message === "Done") {
  //   return redirect("/jobs");
  // }
  return null;
};

const Init = () => {
  const [isInstalling, setIsInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const setupApp = async () => {
    setIsInstalling(true);
    const storage = navigator.storage;
    if (storage) {
      await storage.persist();
    }

    const user = localStorage.getItem("user");
    if (user) {
      const userResponse = await clientApi.post("/init-user", user);
      if (userResponse.status !== 200) {
        navigate("/login");
        return;
      }
    } else {
      navigate("/login");
    }

    setStatus("Fetching all categories");
    const libItemCategoryResponse = await inspectionApi.get(
      "/install-item-categories",
      {
        onDownloadProgress: (e) => {
          const downloadprogress = Math.floor(e.progress! * 100);
          setProgress(downloadprogress);
        },
      }
    );

    if (libItemCategoryResponse.status !== 200) {
      setError(libItemCategoryResponse.data.message);
      setIsInstalling(false);
      return;
    }

    const initLibCategory = await clientApi.post(
      "/init-library-item-categories",
      libItemCategoryResponse.data
    );
    if (initLibCategory.status !== 200) {
      setError("Something went wrong");
      setIsInstalling(false);
      return;
    }

    setStatus("Fetching library items");
    const libraryItemResponse = await inspectionApi.get("/install-items", {
      onDownloadProgress: (e) => {
        const downloadprogress = Math.floor(e.progress! * 100);
        setProgress(downloadprogress);
      },
    });

    if (libraryItemResponse.status !== 200) {
      setError(libraryItemResponse.data.message);
      setIsInstalling(false);
      return;
    }

    setStatus("Setting up offline database for library items");

    const initLibraryResponse = await clientApi.post(
      "/init-library-items",
      libraryItemResponse.data
    );
    if (initLibraryResponse.status !== 200) {
      setError("Something went wrong");
      setIsInstalling(false);
      return;
    }

    setStatus("Fetching inspection notes");

    const jobCategoriesResponse = await inspectionApi.get(
      "/install-job-categories"
    );
    if (jobCategoriesResponse.status !== 200) {
      setError("Something went wrong");
      setIsInstalling(false);
      return;
    }
    const initJobCategories = await clientApi.post(
      "/init-job-categories",
      jobCategoriesResponse.data
    );
    if (initJobCategories.status !== 200) {
      setError("Something went wrong");
      setIsInstalling(false);
      return;
    }

    const libraryNotesResponse = await inspectionApi.get(
      "/install-inspection-notes",
      {
        onDownloadProgress: (e) => {
          const downloadprogress = Math.floor(e.progress! * 100);
          setProgress(downloadprogress);
        },
      }
    );

    if (libraryNotesResponse.status !== 200) {
      setError(libraryNotesResponse.data.message);
      setIsInstalling(false);
      return;
    }
    const initInspectionnotes = await clientApi.post(
      "/init-inspection-notes",
      libraryNotesResponse.data
    );
    if (initInspectionnotes.status !== 200) {
      setError("Something went wrong");
      setIsInstalling(false);
      return;
    }

    setStatus("Fetching inspector recommendations");
    const recomResponse = await inspectionApi.get("/install-recommendations", {
      onDownloadProgress: (e) => {
        const downloadprogress = Math.floor(e.progress! * 100);
        setProgress(downloadprogress);
      },
    });
    if (recomResponse.status !== 200) {
      setError("Something went wrong");
      setIsInstalling(false);
      return;
    }

    const initRecom = await clientApi.post(
      "/init-recommendations",
      recomResponse.data
    );
    if (initRecom.status !== 200) {
      setError("Something went wrong");
      setIsInstalling(false);
      return;
    }

    const template = await (await fetch("/report-template.json")).json();
    const initTemplate = await clientApi.post("/init-template", template);
    if (initTemplate.status !== 200) {
      setError("Something went wrong");
      setIsInstalling(false);
      return;
    }

    setStatus("Fetching initial jobs");
    const jobsResponse = await inspectionApi.get("/install-jobs");
    if (jobsResponse.status !== 200) {
      setError("Something went wrong");
      setIsInstalling(false);
      return;
    }
    const initjobs = await clientApi.post("/init-jobs", jobsResponse.data);
    if (initjobs.status !== 200) {
      setError("Something went wrong");
      setIsInstalling(false);
      return;
    }

    setIsInstalling(false);
    setIsInstalled(true);
  };

  return (
    <Center as="main" bg={"app-bg"} h={"100vh"}>
      <Card w={"100%"} maxW={"2xl"}>
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius={"lg"}
          mb={3}
        >
          <AlertIcon boxSize="40px" />
          <AlertTitle mt={4} mb={1} fontSize="2xl" color={"text.800"}>
            Important
          </AlertTitle>
          <AlertDescription color={"text.700"}>
            This is a Progressive web app, which means this app works as an
            offline website. So if you delete or clear browsing data/history,
            the data of this app will be deleted. So be carefull before clearing
            browsing data.
          </AlertDescription>
        </Alert>
        <Box>
          {!isInstalling && !isInstalled && !error && (
            <ButtonPrimary w="full" onClick={setupApp}>
              Setup App
            </ButtonPrimary>
          )}
          {isInstalling && !isInstalled && (
            <Box textAlign={"center"}>
              <Text fontSize={"lg"} color={"text.700"}>
                {status}
              </Text>
              <Progress value={progress} mt={2} rounded={"full"} />
            </Box>
          )}
          {!isInstalling && isInstalled && (
            <Box textAlign={"center"}>
              <Text fontSize={"lg"} color={"text.700"}>
                Success
              </Text>
              <ButtonPrimary onClick={() => navigate("/jobs")}>
                Go To App
              </ButtonPrimary>
            </Box>
          )}
          {error && (
            <Box textAlign={"center"}>
              <Text fontSize={"lg"} color={"red"}>
                {error}
              </Text>
            </Box>
          )}
        </Box>
      </Card>
    </Center>
  );
};

export default Init;
