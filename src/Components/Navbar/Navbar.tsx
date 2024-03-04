import { AppBar, Toolbar, Typography, Box, Stack, Button } from "@mui/material";
import PageSettingsDrawer from "./PageSettingsDrawer.tsx";
import { useLocation, useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
import "./navbar.css";
import NotificationBell from "./NotificationBell.tsx";

/**
 * Navigation buttons for the Navbar.
 * @param {boolean} usePrimaryColor - If true, the buttons will use the primary color.
 */
function MenuButtons({ usePrimaryColor = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const buttonData = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/messages", label: "Messages" },
    { path: "/search-people", label: "Find People" },
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
          onClick={() => navigate(path)}
        >
          {label}
        </Button>
      ))}
      <NotificationBell usePrimaryColor={usePrimaryColor} />
    </>
  );

  function isCurrentPage(pathname) {
    return location.pathname === pathname;
  }
}

/**
 * Navbar component that provides navigation across the application.
 * It displays an AppBar with the application name and navigation buttons.
 * It includes a settings drawer for mobile views and navigation buttons for larger screens.
 */
function Navbar() {
  // const gotoDashboard = () => {
  //   navigate("/dashboard");
  // };
  // const gotoMessages = () => {
  //   navigate("/messages");
  // };

  // const { t: lang } = useTranslation("home");

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
            <PageSettingsDrawer isMobile>
              <Stack justifyContent="center" alignItems="center">
                {/* Sections */}
                <MenuButtons usePrimaryColor />
              </Stack>
            </PageSettingsDrawer>
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
              <MenuButtons />
              <PageSettingsDrawer />
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

export { Navbar };
