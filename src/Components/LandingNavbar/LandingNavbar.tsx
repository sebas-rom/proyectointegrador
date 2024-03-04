import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import PageSettingsDrawer from "../Navbar/PageSettingsDrawer";
import LandingDrawer from "./LandingDrawer";
import { useNavigate } from "react-router-dom";
/**
 * Navigation buttons for the Navbar.
 * @param {boolean} usePrimaryColor - If true, the buttons will use the primary color.
 */
function LandingMenuButtons({ usePrimaryColor = false }) {
  const navigateToPage = useNavigate();
  const location = useLocation();

  const buttonData = [
    { path: "#dashboard", label: "Dashboard" },
    { path: "#messages", label: "Messages" },
    { path: "#search-people", label: "Find People" },
  ];

  return (
    <>
      {buttonData.map(({ path, label }) => (
        <Button
          key={path}
          style={{
            fontWeight: isCurrentPage(path) ? "bold" : "normal",
            bottom: isCurrentPage(path) ? "3px" : "0px",
          }}
          color={usePrimaryColor ? "primary" : "inherit"}
          disableElevation
          onClick={() => moveTo(path)}
        >
          {label}
        </Button>
      ))}
      <Button
        color="inherit"
        variant="outlined"
        onClick={() => navigateToPage("/login")}
      >
        Log In
      </Button>
      <Button
        color="inherit"
        variant="outlined"
        onClick={() => navigateToPage("/signup")}
      >
        Sign Up
      </Button>
    </>
  );

  function isCurrentPage(pathname) {
    return location.hash === pathname;
  }

  function moveTo(path) {
    window.location.hash = path;
  }
}

function LandingNavbar() {
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          {/* APP LOGO */}
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="h6">FreeEcu</Typography>
          </Stack>

          {/* Menu For Mobile */}
          <Box
            sx={{
              flexGrow: 1,
              justifyContent: "flex-end",
              display: { xs: "flex", md: "none" },
            }}
          >
            <Stack justifyContent="center" alignItems="center">
              {/* Sections */}
              <LandingDrawer isMobile>
                <LandingMenuButtons usePrimaryColor />
              </LandingDrawer>
            </Stack>
          </Box>

          {/* Menu For Web */}
          <Box
            sx={{
              flexGrow: 1,
              justifyContent: "flex-end",
              display: { xs: "none", md: "flex" },
            }}
          >
            <Stack
              direction={"row"}
              spacing={4}
              justifyContent="center"
              alignItems="center"
            >
              {/* Sections */}
              <LandingMenuButtons />
            </Stack>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Utility box to move content bellow the navbar */}
      <Box
        sx={{
          height: {
            xs: 54, // 64px on extra-small screens
            sm: 64, // 64px on small screens
          },
        }}
      ></Box>
    </>
  );
}

export default LandingNavbar;
