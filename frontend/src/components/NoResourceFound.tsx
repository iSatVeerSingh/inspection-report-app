import { Box, Center, Text } from "@chakra-ui/react";
import React from "react";

const NoResourceFound = ({ children }: { children?: React.ReactNode }) => {
  return (
    <Center h={"500px"}>
      <Box>
        <Text fontSize={"2xl"}>{children || "No resource found"}</Text>
      </Box>
    </Center>
  );
};

export default NoResourceFound;
