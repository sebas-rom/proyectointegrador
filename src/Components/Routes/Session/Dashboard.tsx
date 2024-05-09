import { Button, Container, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import IncomeBarChart from "../../Dashboard/IncomeBarChart.tsx";
import CustomPaper from "../../CustomMUI/CustomPaper.tsx";
import ProfileVisits from "../../Dashboard/ProfileVisits.tsx";
import ActiveMilestones from "../../Dashboard/ActiveMilestones.tsx";
import { useEffect, useState } from "react";
import { auth, isFreelancer } from "../../../Contexts/Session/Firebase.tsx";
import { Link } from "react-router-dom";
import { MY_BALANCE_PATH } from "../routes.tsx";

/**
 * The Dashboard component is the main container for user interaction after login.
 * It checks if the sign-up process has been completed and conditionally renders the
 * CompleteSignUp component if necessary.
 *
 * The CompleteSignUp component is loaded lazily for performance optimization.
 * This component also provides a loading state fallback while waiting for the CompleteSignUp
 * component to load. If the sign-up is already completed, additional components, such as Navbar,
 * might be rendered in future versions.
 */
const Dashboard = () => {
  const [freelancer, setFreelancer] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    async function checkFreelancerStatus() {
      // Check if user is a freelancer
      setFreelancer(await isFreelancer(auth.currentUser.uid));
      setLoading(false);
    }
    checkFreelancerStatus();
  }, []);
  return (
    <>
      <Container sx={{ paddingTop: 2, paddingBottom: 2 }}>
        <Grid container rowSpacing={1} columnSpacing={2}>
          <Grid>
            <Typography variant="h5">Recent Orders</Typography>
          </Grid>
          <Grid xs={12}>
            <CustomPaper>
              <ActiveMilestones />
            </CustomPaper>
          </Grid>
        </Grid>

        <Grid container rowSpacing={1} columnSpacing={2}>
          <Grid xs={12} md={7} lg={8} sx={{ height: 500, display: "flex", flexDirection: "column" }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid width={"100%"}>
                <Typography variant="h5" sx={{ paddingTop: 1, paddingBottom: 1 }}>
                  Profile Visitors
                </Typography>
              </Grid>
            </Grid>
            <CustomPaper
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <ProfileVisits />
            </CustomPaper>
          </Grid>

          {loading || !freelancer ? (
            <>
              <Grid xs={12} md={5} lg={4} sx={{ height: 500, display: "flex", flexDirection: "column" }}>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" sx={{ paddingTop: 1, paddingBottom: 1, color: "transparent" }}>
                    -
                  </Typography>
                  <Grid />
                </Grid>
                <CustomPaper
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {!freelancer && (
                    <Stack alignItems={"center"} justifyContent={"center"} width={"100%"} height={"100%"}>
                      <Typography>Comming Soon</Typography>
                    </Stack>
                  )}
                </CustomPaper>
              </Grid>
            </>
          ) : (
            <>
              <Grid xs={12} md={5} lg={4} sx={{ height: 500, display: "flex", flexDirection: "column" }}>
                <Grid container alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" sx={{ paddingTop: 1, paddingBottom: 1 }}>
                    Income Overview
                  </Typography>
                  <Grid />
                </Grid>
                <CustomPaper
                  sx={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <IncomeBarChart incomes={[10, 20, 0, 0, 14, 5, 0]} />
                </CustomPaper>
              </Grid>
            </>
          )}
        </Grid>
        {freelancer && (
          <Button variant="outlined" sx={{ margin: 2 }}>
            <Link
              to={`/${MY_BALANCE_PATH}`}
              style={{
                textDecoration: "none",
                color: "inherit",
              }}
            >
              Balance
            </Link>
          </Button>
        )}
      </Container>
    </>
  );
};

export default Dashboard;
