import React from "react";
import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";

// Function to generate a random width within a range
function getRandomWidth(baseWidth, range) {
  const min = baseWidth - range;
  const max = baseWidth + range;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// New component for the ListItemButton with random widths for skeletons
function RepeatedListItemButton() {
  // Define base widths for skeletons
  const primaryWidth = 95;
  const secondaryWidth = 65;
  // Define range for random width variation
  const widthRange = 15;

  return (
    <>
      <ListItemButton>
        <Stack
          direction={"row"}
          spacing={2}
          height={"auto"}
          width={"100%"}
          justifyContent="flex-start"
          alignItems="center"
        >
          <Skeleton variant="circular" width={45} height={45} />
          <Stack flexGrow={1}>
            <Stack direction={"row"}>
              <ListItemText
                primary={
                  <Skeleton
                    variant="text"
                    width={getRandomWidth(primaryWidth, widthRange)}
                  />
                }
              />
              <Skeleton variant="text" width={secondaryWidth} />
            </Stack>
            <Box
              sx={{
                height: "40px",
                width: "100%",
                overflow: "hidden",
              }}
            >
              <Skeleton
                variant="text"
                width={getRandomWidth(secondaryWidth, widthRange)}
              />
            </Box>
          </Stack>
        </Stack>
      </ListItemButton>
      <Divider />
    </>
  );
}

function messageListSkeleton() {
  return (
    <List>
      {/* Render the RepeatedListItemButton component six times */}
      {[...Array(10)].map((_, index) => (
        <RepeatedListItemButton key={index} />
      ))}
    </List>
  );
}

export default messageListSkeleton;
