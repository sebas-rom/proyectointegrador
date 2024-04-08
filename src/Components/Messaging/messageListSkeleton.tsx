import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
} from "@mui/material";

/**
 * Randomly generates a width for an element within a specified range.
 *
 * @param baseWidth The base width around which the random width is generated.
 * @param range The range (plus/minus) to apply to the base width.
 * @returns A random width in pixels as a number.
 */
function getRandomWidth(baseWidth, range) {
  const min = baseWidth - range;
  const max = baseWidth + range;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * RepeatedListItemButton component.
 *
 * This component displays a ListItemButton with skeletons of random widths
 * to represent loading text or image placeholders.
 *
 * @returns React JSX element representing a list item button with skeletons.
 */
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
    </>
  );
}

/**
 * MessageListSkeleton component.
 *
 * This component represents a list of skeleton message items used for loading placeholders.
 *
 * @returns React JSX element representing a list of skeleton message items.
 */
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
