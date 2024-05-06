import { Container, List, ListItemButton, ListItemText, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2

import { useState } from "react";
import AnalyticEcommerce from "../../Dashboard/AnalyticEcommerce.tsx";
import IncomeAreaChart from "../../Dashboard/IncomeAreaChart.tsx";
import IncomeBarChart from "../../Dashboard/IncomeBarChart.tsx";
import OrdersTable from "../../Dashboard/OrdersTable.tsx";
import ReportAreaChart from "../../Dashboard/ReportAreaChart.tsx";
import SalesColumnChart from "../../Dashboard/SalesColumnChart.tsx";
import CustomPaper from "../../CustomMUI/CustomPaper.tsx";
import ProfileVisits from "../../Dashboard/ProfileVisits.tsx";

// avatar style
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: "1rem",
};

// action style
const actionSX = {
  mt: 0.75,
  ml: 1,
  top: "auto",
  right: "auto",
  alignSelf: "flex-start",
  transform: "none",
};

// sales report status
const status = [
  {
    value: "today",
    label: "Today",
  },
  {
    value: "month",
    label: "This Month",
  },
  {
    value: "year",
    label: "This Year",
  },
];

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
  const [value, setValue] = useState("today");
  const [slot, setSlot] = useState<"month" | "week">("week");

  return (
    <>
      <Container>
        <Grid container rowSpacing={1} columnSpacing={2}>
          <Grid>
            <Typography variant="h5">Recent Orders</Typography>
          </Grid>
          <Grid xs={12}>
            <CustomPaper>
              <OrdersTable />
            </CustomPaper>
          </Grid>
        </Grid>

        <Grid container rowSpacing={1} columnSpacing={2}>
          <Grid xs={12} md={7} lg={8} sx={{ height: 500, display: "flex", flexDirection: "column" }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid width={"100%"}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems={"center"}
                  width={"100%"}
                  sx={{ paddingTop: 1, paddingBottom: 1 }}
                >
                  <Typography variant="h5">Profile Visitors</Typography>
                </Stack>
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

          <Grid xs={12} md={5} lg={4} sx={{ height: 500, display: "flex", flexDirection: "column" }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid width={"100%"}>
                <Stack
                  direction="row"
                  alignItems={"center"}
                  width={"100%"}
                  height={"100%"}
                  sx={{ paddingTop: 1, paddingBottom: 1 }}
                >
                  <Typography variant="h5">Income Overview</Typography>
                </Stack>
              </Grid>
              <Grid />
            </Grid>
            <CustomPaper sx={{ height: "100%", flexGrow: 1 }}>
              <IncomeBarChart incomes={[10, 20, 0, 0, 14, 5, 0]} />
            </CustomPaper>
          </Grid>
        </Grid>

        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          <Grid xs={12} md={7} lg={8}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid>
                <Typography variant="h5">Recent Orders</Typography>
              </Grid>
              <Grid />
            </Grid>
            <CustomPaper>
              <OrdersTable />
            </CustomPaper>
          </Grid>
          <Grid xs={12} md={5} lg={4}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid>
                <Typography variant="h5">Analytics Report</Typography>
              </Grid>
              <Grid />
            </Grid>
            <CustomPaper>
              <List
                sx={{
                  p: 0,
                  "& .MuiListItemButton-root": {
                    py: 2,
                  },
                }}
              >
                <ListItemButton divider>
                  <ListItemText primary="Company Finance Growth" />
                  <Typography variant="h5">+45.14%</Typography>
                </ListItemButton>
                <ListItemButton divider>
                  <ListItemText primary="Company Expenses Ratio" />
                  <Typography variant="h5">0.58%</Typography>
                </ListItemButton>
                <ListItemButton>
                  <ListItemText primary="Business Risk Cases" />
                  <Typography variant="h5">Low</Typography>
                </ListItemButton>
              </List>
              <ReportAreaChart />
            </CustomPaper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard;
