import { Skeleton, Stack } from "@mui/material";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar";

/**
 * Generates a Skeleton layout for messages with an optional circular skeleton for a profile picture.
 *
 * @param {number} size - The size of the circular skeleton to represent a profile picture. Defaults to 45 if not specified.
 * @param {number} percentage - The width percentage of the rectangular skeleton that represents the message.
 * @param {boolean} reverse - Determines the order of elements in the stack. When `true`, the order is reversed. Defaults to `false`.
 * @param {boolean} photo - When `true`, a circular Skeleton is included to represent a profile picture. Defaults to `false`.
 * @returns {JSX.Element} A `Stack` element containing the Skeleton placeholders for a message and optional profile picture.
 */
function generateSkeleton(
  size = 45,
  percentage,
  reverse = false,
  photo = false
) {
  return (
    <Stack direction={reverse ? "row-reverse" : "row"} sx={{ paddingTop: 1 }}>
      {photo ? (
        <div
          style={{
            marginLeft: !reverse ? "10px" : "5px",
            marginRight: !reverse ? "5px" : "10px",
          }}
        >
          <ColoredAvatar makeSkeleton size={size} />
        </div>
      ) : (
        <div
          style={{
            marginLeft: "10px",
            marginRight: "5px",
            width: size,
            height: size,
          }}
        />
      )}

      <Skeleton
        variant="rectangular"
        width={`${percentage}%`}
        height={50}
        sx={{
          borderBottomLeftRadius: !reverse ? 15 : 5,
          borderTopRightRadius: !reverse ? 15 : 5,
          borderBottomRightRadius: reverse ? 15 : 5,
          borderTopLeftRadius: reverse ? 15 : 5,
        }}
      />
    </Stack>
  );
}

/**
 * MessageSkeleton component renders a series of placeholder skeletons for messages.
 * It includes different variations to mimic the alternation of messages between "mine" and "other".
 * 
 * @returns {JSX.Element} The group of Skeleton elements to represent the loading state of message components.
 */
function MessageSkeleton() {
  return (
    <>
      {/* Other */}
      {generateSkeleton(45, 40, false, true)}
      {generateSkeleton(45, 30, false)}
      {generateSkeleton(45, 35, false)}
      {/* Mine */}
      {generateSkeleton(45, 40, true, true)}
      {generateSkeleton(45, 30, true)}
      {generateSkeleton(45, 35, true)}
      {/* Other */}
      {generateSkeleton(45, 40, false, true)}
      {/* Mine */}
      {generateSkeleton(45, 40, true, true)}
      {/* Other */}
      {generateSkeleton(45, 40, false, true)}
      {generateSkeleton(45, 35, false)}
      {/* Mine */}
      {generateSkeleton(45, 40, true, true)}
      {generateSkeleton(45, 35, true)}
    </>
  );
}

export default MessageSkeleton;
