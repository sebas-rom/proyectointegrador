import {
  Box,
  Button,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import ColoredAvatar from "../CustomMUI/ColoredAvatar";

function ProposeNewMilestoneSkeleton() {
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
            <Skeleton width={150} />
          </Typography>
          <div />
        </Stack>

        <div />
      </Stack>

      <Box component="form">
        <Stack spacing={2}>
          <Typography variant="h5">
            <Skeleton width={"35%"} />
          </Typography>
          <Typography variant="h3">
            <Skeleton width={"25%"} />
          </Typography>
          <Typography variant="body1">
            <Skeleton width={"5%"} />
          </Typography>
          <div />
        </Stack>

        <Typography variant="h5">
          <Skeleton width={150} />
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  <Skeleton width={"100%"} />
                </TableCell>
                <TableCell align="center">
                  <Skeleton width={"100%"} />
                </TableCell>
                <TableCell align="center">
                  <Skeleton width={"100%"} />
                </TableCell>
                <TableCell align="center">
                  <Skeleton width={"100%"} />
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {repetitionArray.map((_, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row" align="center">
                    <Typography>
                      <Skeleton width={"100%"} />
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      <Skeleton width={"100%"} />
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>
                      <Skeleton width={"100%"} />
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Skeleton width={"100%"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
          <Button variant="outlined" color="primary">
            <Skeleton width={150} />
          </Button>
          <div />
        </Stack>

        <Stack spacing={2} alignItems={"center"} justifyContent={"center"}>
          <Typography variant="h6">
            <Skeleton width={150} />
          </Typography>

          <Typography variant="subtitle1">
            <Skeleton width={150} />
          </Typography>

          <div />
        </Stack>

        <Stack spacing={2} alignItems={"center"} direction={"row"} justifyContent={"center"}>
          <Button variant="contained" color="primary">
            <Skeleton width={150} />
          </Button>
          <Button variant="outlined" color="error">
            <Skeleton width={150} />
          </Button>
        </Stack>
      </Box>
    </>
  );
}

export default ProposeNewMilestoneSkeleton;
