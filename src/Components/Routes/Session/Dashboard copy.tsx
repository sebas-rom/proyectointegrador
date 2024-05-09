import {
  Container,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import SettingsIcon from "@mui/icons-material/Settings";

import { useState } from "react";
import AnalyticEcommerce from "../../Dashboard/AnalyticEcommerce.tsx";
import IncomeAreaChart from "../../Dashboard/IncomeAreaChart.tsx";
import IncomeBarChart from "../../Dashboard/IncomeBarChart.tsx";
import OrdersTable from "../../Dashboard/OrdersTable.tsx";
import ReportAreaChart from "../../Dashboard/ReportAreaChart.tsx";
import SalesColumnChart from "../../Dashboard/SalesColumnChart.tsx";
import CustomPaper from "../../CustomMUI/CustomPaper.tsx";
import ProfileVisits from "../../Dashboard/ProfileVisits.tsx";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
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
        <Grid container rowSpacing={4.5} columnSpacing={2.75}>
          {/* row 1 */}
          <Grid xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce title="Total Page Views" count="4,42,236" percentage={59.3} extra="35,000" />
          </Grid>
          <Grid xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce title="Total Users" count="78,250" percentage={70.5} extra="8,900" />
          </Grid>
          <Grid xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
              title="Total Order"
              count="18,800"
              percentage={27.4}
              isLoss
              color="warning"
              extra="1,943"
            />
          </Grid>
          <Grid xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
              title="Total Sales"
              count="$35,078"
              percentage={27.4}
              isLoss
              color="warning"
              extra="$20,395"
            />
          </Grid>
          <Grid
            md={8}
            sx={{
              display: {
                sm: "none",
                md: "block",
                lg: "none",
              },
            }}
          />

          <Grid xs={12} md={7} lg={8}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid>
                <Typography variant="h5">Unique Visitor</Typography>
              </Grid>
              <Grid>
                <ToggleButtonGroup value={slot} exclusive size="small" color="primary">
                  <ToggleButton value="week" onClick={() => setSlot("week")}>
                    Week
                  </ToggleButton>
                  <ToggleButton value="month" onClick={() => setSlot("month")}>
                    Month
                  </ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            </Grid>
            <CustomPaper>
              {/* <IncomeAreaChart slot={slot} /> */}
              <ProfileVisits />
            </CustomPaper>
          </Grid>

          <Grid xs={12} md={5} lg={4}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid>
                <Typography variant="h5">Income Overview</Typography>
              </Grid>
              <Grid />
            </Grid>

            <IncomeBarChart incomes={[10, 20, 0, 0, 14, 5, 0]} />
          </Grid>

          {/* row 3 */}
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

          {/* row 4 */}
          <Grid xs={12} md={7} lg={8}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid>
                <Typography variant="h5">Sales Report</Typography>
              </Grid>
              <Grid>
                <TextField
                  id="standard-select-currency"
                  size="small"
                  select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  sx={{
                    "& .MuiInputBase-input": {
                      py: 0.5,
                      fontSize: "0.875rem",
                    },
                  }}
                >
                  {status.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <CustomPaper>
              <Stack
                spacing={1.5}
                sx={{
                  mb: -12,
                }}
              >
                <Typography variant="h6" color="secondary">
                  Net Profit
                </Typography>
                <Typography variant="h4">$1560</Typography>
              </Stack>
              <SalesColumnChart />
            </CustomPaper>
          </Grid>
          <Grid xs={12} md={5} lg={4}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Grid>
                <Typography variant="h5">Transaction History</Typography>
              </Grid>
              <Grid />
            </Grid>
            <CustomPaper>
              <List
                component="nav"
                sx={{
                  px: 0,
                  py: 0,
                  "& .MuiListItemButton-root": {
                    py: 1.5,
                    "& .MuiAvatar-root": avatarSX,
                    "& .MuiListItemSecondaryAction-root": {
                      ...actionSX,
                      position: "relative",
                    },
                  },
                }}
              >
                <ListItemButton divider>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        color: "success.main",
                        bgcolor: "success.lighter",
                      }}
                    >
                      <Inventory2Icon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle1">Order #002434</Typography>}
                    secondary="Today, 2:00 AM"
                  />
                  <ListItemSecondaryAction>
                    <Stack alignItems="flex-end">
                      <Typography variant="subtitle1" noWrap>
                        + $1,430
                      </Typography>
                      <Typography variant="h6" color="secondary" noWrap>
                        78%
                      </Typography>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItemButton>
                <ListItemButton divider>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        color: "primary.main",
                        bgcolor: "primary.lighter",
                      }}
                    >
                      <ChatBubbleIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle1">Order #984947</Typography>}
                    secondary="5 August, 1:45 PM"
                  />
                  <ListItemSecondaryAction>
                    <Stack alignItems="flex-end">
                      <Typography variant="subtitle1" noWrap>
                        + $302
                      </Typography>
                      <Typography variant="h6" color="secondary" noWrap>
                        8%
                      </Typography>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItemButton>
                <ListItemButton>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        color: "error.main",
                        bgcolor: "error.lighter",
                      }}
                    >
                      <SettingsIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="subtitle1">Order #988784</Typography>}
                    secondary="7 hours ago"
                  />
                  <ListItemSecondaryAction>
                    <Stack alignItems="flex-end">
                      <Typography variant="subtitle1" noWrap>
                        + $682
                      </Typography>
                      <Typography variant="h6" color="secondary" noWrap>
                        16%
                      </Typography>
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItemButton>
              </List>
            </CustomPaper>
            <CustomPaper>
              <Stack spacing={3}>
                <Grid container justifyContent="space-between" alignItems="center">
                  <Grid>
                    <Stack>
                      <Typography variant="h5" noWrap>
                        Help & Support Chat
                      </Typography>
                      <Typography variant="caption" color="secondary" noWrap>
                        Typical replay within 5 min
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid>
                    <AvatarGroup
                      sx={{
                        "& .MuiAvatar-root": {
                          width: 32,
                          height: 32,
                        },
                      }}
                    >
                      <Avatar alt="Remy Sharp" />
                      <Avatar alt="Travis Howard" />
                      <Avatar alt="Cindy Baker" />
                      <Avatar alt="Agnes Walker" />
                    </AvatarGroup>
                  </Grid>
                </Grid>
                <Button
                  size="small"
                  variant="contained"
                  sx={{
                    textTransform: "capitalize",
                  }}
                >
                  Need Help?
                </Button>
              </Stack>
            </CustomPaper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Dashboard;