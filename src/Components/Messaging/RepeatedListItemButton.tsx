import { Box, ListItemButton, ListItemText, Skeleton, Stack } from "@mui/material";
import ColoredAvatar from "../CustomMUI/ColoredAvatar";

/**
 * RepeatedListItemButton component.
 *
 * This component displays a ListItemButton with skeletons of random widths
 * to represent loading text or image placeholders.
 *
 * @returns React JSX element representing a list item button with skeletons.
 */
function RepeatedListItemButton() {
  function getRandomWidth(baseWidth, range) {
    const min = baseWidth - range;
    const max = baseWidth + range;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
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
          <ColoredAvatar makeSkeleton size="medium" />
          <Stack flexGrow={1}>
            <Stack direction={"row"}>
              <ListItemText primary={<Skeleton variant="text" width={getRandomWidth(primaryWidth, widthRange)} />} />
              <Skeleton variant="text" width={secondaryWidth} />
            </Stack>
            <Box
              sx={{
                height: "40px",
                width: "100%",
                overflow: "hidden",
              }}
            >
              <Skeleton variant="text" width={getRandomWidth(secondaryWidth, widthRange)} />
            </Box>
          </Stack>
        </Stack>
      </ListItemButton>
    </>
  );
}

export default RepeatedListItemButton;
