import { Button, Container, Divider, Skeleton, Stack, Step, StepLabel, Stepper, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import CustomPaper from "../DataDisplay/CustomPaper";
import ColoredAvatar from "../DataDisplay/ColoredAvatar";

function ViewContractSkeleton() {
  return (
    <Container
      maxWidth="lg"
      sx={{
        marginTop: "10px",
      }}
    >
      <CustomPaper
        sx={{
          padding: 4,
        }}
      >
        <Stack direction={"row"} alignItems={"center"} spacing={2}>
          <ColoredAvatar size={"large"} makeSkeleton />
          <Stack justifyContent="flex-start" alignItems="flex-start">
            <Typography variant="h4">
              <Skeleton width={300} />
            </Typography>
            <Button>
              <Skeleton width={50} />
            </Button>
          </Stack>
        </Stack>

        <CustomPaper
          sx={{
            padding: 2,
            marginTop: 2,
            boxShadow: 0,
          }}
          messagePaper
        >
          <Grid
            container
            columnSpacing={4}
            rowSpacing={2}
            sx={{
              width: "100%",
            }}
          >
            <Grid md={2} xs={6}>
              <Stack>
                <Typography variant={"button"} textAlign={"center"}>
                  <Skeleton width={100} />
                </Typography>
                <Typography fontSize={25} fontWeight={400} textAlign={"center"}>
                  <Skeleton />
                </Typography>
              </Stack>
            </Grid>
            <Grid md={2} xs={6}>
              <Stack>
                <Typography variant={"button"} textAlign={"center"}>
                  <Skeleton width={100} />
                </Typography>
                <Typography fontSize={25} fontWeight={400} textAlign={"center"}>
                  <Skeleton />
                </Typography>
              </Stack>
            </Grid>
            <Grid md={2} xs={6}>
              <Stack>
                <Typography variant={"button"} textAlign={"center"}>
                  <Skeleton width={100} />
                </Typography>
                <Typography fontSize={25} fontWeight={400} textAlign={"center"}>
                  <Skeleton />
                </Typography>
              </Stack>
            </Grid>
            <Grid md={3} xs={6}>
              <Stack>
                <Typography variant={"button"} textAlign={"center"}>
                  <Skeleton width={100} />
                </Typography>
                <Typography fontSize={25} fontWeight={400} textAlign={"center"}>
                  <Skeleton />
                </Typography>
              </Stack>
            </Grid>
            <Grid md={3} xs={12}>
              <Stack direction={"row"} spacing={2} justifyContent={"flex-end"}>
                <Divider orientation="vertical" flexItem variant="middle" />
                <Stack>
                  <Typography variant={"button"} textAlign={"center"}>
                    <Skeleton width={100} />
                  </Typography>
                  <Typography fontSize={25} fontWeight={600} textAlign={"center"}>
                    <Skeleton />
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CustomPaper>

        <Stack spacing={2}>
          <div />
          <Typography variant="h2">
            <Skeleton width={400} />
          </Typography>
          <Typography>
            <Skeleton width={100} />
          </Typography>

          <Stepper orientation="vertical">
            <Step active={false}>
              <StepLabel>
                <Typography>
                  <Skeleton width={200} />
                </Typography>

                <>
                  <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
                    <Typography>
                      <Skeleton width={70} />
                    </Typography>

                    <Typography>
                      <Skeleton width={50} />
                    </Typography>
                  </Stack>
                </>
              </StepLabel>
            </Step>
            <Step active={false}>
              <StepLabel>
                <Typography>
                  <Skeleton width={200} />
                </Typography>

                <>
                  <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
                    <Typography>
                      <Skeleton width={70} />
                    </Typography>

                    <Typography>
                      <Skeleton width={50} />
                    </Typography>
                  </Stack>
                </>
              </StepLabel>
            </Step>
            <Step active={false}>
              <StepLabel>
                <Typography>
                  <Skeleton width={200} />
                </Typography>

                <>
                  <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
                    <Typography>
                      <Skeleton width={70} />
                    </Typography>

                    <Typography>
                      <Skeleton width={50} />
                    </Typography>
                  </Stack>
                </>
              </StepLabel>
            </Step>
            <Step active={false}>
              <StepLabel>
                <Typography>
                  <Skeleton width={200} />
                </Typography>

                <>
                  <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
                    <Typography>
                      <Skeleton width={70} />
                    </Typography>

                    <Typography>
                      <Skeleton width={50} />
                    </Typography>
                  </Stack>
                </>
              </StepLabel>
            </Step>
          </Stepper>
          <Button>
            <Skeleton width={50} />
          </Button>
        </Stack>
      </CustomPaper>
    </Container>
  );
}

export default ViewContractSkeleton;
