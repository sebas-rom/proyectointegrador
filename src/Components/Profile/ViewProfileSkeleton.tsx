import { Button, Skeleton, Stack, Typography } from "@mui/material";
import ColoredAvatar from "../CustomMUI/ColoredAvatar";

function ViewProfileSkeleton() {
  return (
    <Stack spacing={2} width={"100%"}>
      <Stack direction="row" justifyContent={"space-between"} alignItems={"center"} spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <ColoredAvatar size="large" makeSkeleton />
          <Stack>
            <Typography variant="h4">
              <Skeleton width={300} />
            </Typography>
            <Typography variant="subtitle1">
              <Skeleton width={300} />
            </Typography>
            <Stack direction={"row"} alignItems={"center"}>
              <Typography color={"gray"} variant="subtitle2">
                <Skeleton width={300} />
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Skeleton width={100} />
      </Stack>
      <Skeleton width={"100%"} height={100} variant="rectangular" />
      <Skeleton width={"100%"} height={200} variant="rectangular" />
      <Skeleton width={"100%"} height={350} variant="rectangular" />
    </Stack>
  );
}

export default ViewProfileSkeleton;
