import { Skeleton, Stack } from "@mui/material";

function generateSkeleton(
  size = 45,
  percentage,
  reverse = false,
  photo = false
) {
  return (
    <Stack direction={reverse ? "row-reverse" : "row"} sx={{ paddingTop: 1 }}>
      {photo ? (
        <Skeleton
          variant="circular"
          width={size}
          height={size}
          sx={{
            marginLeft: !reverse ? "10px" : "5px",
            marginRight: !reverse ? "5px" : "10px",
          }}
        />
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
