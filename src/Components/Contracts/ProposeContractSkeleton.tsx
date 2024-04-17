import { Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import ColoredAvatar from "../DataDisplay/ColoredAvatar";

function ProposeContractSkeleton() {
  const repetitionArray = new Array(3).fill(null);
  return (
    <>
      <Stack spacing={2} alignItems={"center"}>
        <Typography variant="h3">
          <Skeleton width={400} />
        </Typography>

        <Stack direction={"row"} alignContent={"center"} alignItems={"center"} spacing={1}>
          <ColoredAvatar makeSkeleton />
          <Typography variant="h6">
            <Skeleton width={100} />
          </Typography>
          <div />
        </Stack>

        <div />
      </Stack>

      <Box>
        <Stack spacing={0}>
          <Typography variant="h5">
            <Skeleton width={"25%"} />
          </Typography>
          <Skeleton width={"100%"} height={90} />
          <Skeleton width={"100%"} height={170} sx={{ marginTop: -4.5 }} />

          <div />
        </Stack>

        <Typography variant="h5">
          <Skeleton width={"25%"} />
        </Typography>
        {repetitionArray.map((_, index) => (
          <div key={index}>
            <Typography
              variant="body1"
              sx={{
                marginLeft: 2,
              }}
            >
              <Skeleton width={"5%"} />
            </Typography>
            <Grid
              container
              columnSpacing={1}
              sx={{
                width: "100%",
              }}
            >
              <Grid xs={12} md={6}>
                <Skeleton width={"100%"} height={90} />
              </Grid>
              <Grid xs={6} md={3}>
                <Skeleton width={"100%"} height={90} />
              </Grid>
              <Grid xs={index === 0 ? 6 : 5} md={index === 0 ? 3 : 2}>
                <Skeleton width={"100%"} height={90} />
              </Grid>
            </Grid>
          </div>
        ))}

        <Stack spacing={2} alignItems={"center"}>
          <div />
          <Button color="primary">
            <Skeleton width={"100%"} />
          </Button>
          <div />
        </Stack>

        <Stack spacing={2} alignItems={"center"} justifyContent={"center"}>
          <Typography variant="h6">
            <Skeleton width={200} />
          </Typography>

          <Typography variant="subtitle1">
            <Skeleton width={200} />
          </Typography>

          <div />
        </Stack>

        <Stack spacing={2} alignItems={"center"} direction={"row"} justifyContent={"center"}>
          <Button variant="contained" color="primary">
            <Skeleton width={200} />
          </Button>
          <Button variant="outlined" color="error">
            <Skeleton width={200} />
          </Button>
        </Stack>
      </Box>
    </>
  );
}

export default ProposeContractSkeleton;
