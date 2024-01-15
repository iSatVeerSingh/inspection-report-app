import { Avatar, Flex, Grid, Text } from "@chakra-ui/react";
import menuitems from "../router/menuitems";
import {
  Link,
  LoaderFunction,
  Outlet,
  redirect,
  useLocation,
} from "react-router-dom";
import { GlobalContext } from "../context/globalContext";
import DBWorker from "../worker/worker?worker";

export const dashboardLoader: LoaderFunction = ({ request }) => {
  try {
    const user = localStorage.getItem("user");
    if (!user) {
      return redirect("/login");
    }

    const url = new URL(request.url);
    if (url.pathname === "/") {
      return redirect("/jobs");
    }

    return JSON.parse(user);
  } catch (err) {
    console.log(err);
    return redirect("/login");
  }
};

const Dashboard = () => {
  const { pathname } = useLocation();
  const currentPath = pathname.split("/")[1];
  const worker = new DBWorker();

  return (
    <GlobalContext.Provider value={{ worker }}>
      <Grid
        as="main"
        gridTemplateColumns={"250px auto"}
        h={"100vh"}
        overflow={"hidden"}
        bg={"app-bg"}
      >
        <Grid
          bg={"main-bg"}
          px={"3"}
          shadow={"xs"}
          gridTemplateRows={"60px auto"}
        >
          <Flex gap={2} alignItems={"center"} py={3}>
            <Avatar src="/logo.png" size={"sm"} />
            <Text fontSize={"lg"}>Satveer Singh</Text>
          </Flex>
          <Flex direction={"column"} py={2} gap={2}>
            {menuitems.map((item, index) => (
              <Link to={item.path} key={index}>
                <Flex
                  alignItems={"center"}
                  gap={2}
                  px="3"
                  py={2}
                  borderRadius={"full"}
                  bg={
                    item.path === "/" + currentPath
                      ? "primary.500"
                      : "primary.50"
                  }
                  color={item.path === "/" + currentPath ? "white" : "text.700"}
                  fontSize={"lg"}
                >
                  <item.icon boxSize={6} />
                  <Text as="span">{item.name}</Text>
                </Flex>
              </Link>
            ))}
          </Flex>
        </Grid>
        <Outlet />
      </Grid>
    </GlobalContext.Provider>
  );
};

export default Dashboard;
