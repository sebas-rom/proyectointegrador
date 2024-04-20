import { AppBar, Toolbar, Typography, Box, Stack, Button } from "@mui/material";
import PageSettingsDrawer from "./PageSettingsDrawer.tsx";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NotificationBell from "./NotificationBell.tsx";
// import { t } from "i18next";

/**
 * Navigation buttons for the Navbar.
 * @param {boolean} usePrimaryColor - If true, the buttons will use the primary color.
 */
function MenuButtons({ usePrimaryColor = false }) {
  const location = useLocation();
  const { t } = useTranslation("global");

  const buttonData = [
    {
      path: "/dashboard",
      label: t("dashboard"),
    },
    {
      path: "/messages",
      label: t("messages"),
    },
    {
      path: "/search-people",
      label: t("findpeople"),
    },
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
        >
          <Link
            to={path}
            key={path}
            style={{
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {label}
          </Link>
        </Button>
      ))}
      <NotificationBell usePrimaryColor={usePrimaryColor} />
    </>
  );

  function isCurrentPage(pathname) {
    return location.pathname.startsWith(pathname);
  }
}

/**
 * Navbar component that provides navigation across the application.
 * It displays an AppBar with the application name and navigation buttons.
 * It includes a settings drawer for mobile views and navigation buttons for larger screens.
 */
function Navbar() {
  // const { t: lang } = useTranslation("home");
  return (
    <>
      <AppBar position="relative" elevation={0} component="nav">
        <Toolbar>
          {/* APP LOGO */}
          <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
            <Typography variant="h6">FreeEcu</Typography>
          </Stack>

          {/* Menu For Mobile */}
          <Box
            sx={{
              flexGrow: 1,
              justifyContent: "flex-end",
              display: {
                xs: "flex",
                md: "none",
              },
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
              display: {
                xs: "none",
                md: "flex",
              },
            }}
          >
            <Stack direction={"row"} spacing={4} justifyContent="center" alignItems="center">
              {/* Sections */}
              <MenuButtons />
              <PageSettingsDrawer />
            </Stack>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Utility box to move content bellow the navbar */}
      {/* <Box
        sx={{
          height: {
            xs: 54, // 64px on extra-small screens
            sm: 64, // 64px on small screens
          },
        }}
      ></Box> */}
    </>
  );
}

export { Navbar };
