import { useLocation } from "react-router-dom";
import PageLayout from "../../layouts/PageLayout";
import { InspectionItem } from "../../types";
import { useEffect } from "react";
import clientApi from "../../api/clientApi";
import Card from "../../components/Card";
import MiniDetail from "../../components/MiniDetail";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";

const PreviousItemPreview = () => {
  const { state } = useLocation();
  const { item }: { item: InspectionItem } = state;

  return (
    <PageLayout title="Previous Item Preview">
      <Card>
        <Grid gap={2}>
          <MiniDetail property="Name" value={item.name} />
          <MiniDetail property="Category" value={item.category} />
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
              {(item.images as string[]).map((img, index) => (
                <Image
                  src={img}
                  alt={`Image for ${item.name}`}
                  key={index}
                  maxW={"200px"}
                  maxH={"200px"}
                />
              ))}
            </Flex>
          </Box>
        </Grid>
      </Card>
    </PageLayout>
  );
};

export default PreviousItemPreview;
