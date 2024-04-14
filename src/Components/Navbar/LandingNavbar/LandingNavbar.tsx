import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import LandingDrawer from "./LandingDrawer";
import { useNavigate } from "react-router-dom";
/**
 * Navigation buttons for the Navbar.
 * @param {boolean} usePrimaryColor - If true, the buttons will use the primary color.
 */
function LandingMenuButtons() {
  const navigateToPage = useNavigate();

  return (
    <>
      <Button color="inherit" variant="outlined" onClick={() => navigateToPage("/login")}>
        Log In
      </Button>
      <Button color="inherit" variant="outlined" onClick={() => navigateToPage("/signup")}>
        Sign Up
      </Button>
    </>
  );
}

function LandingNavbar() {
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
            <Stack justifyContent="center" alignItems="center">
              {/* Sections */}
              <LandingDrawer isMobile>
                <LandingMenuButtons />
              </LandingDrawer>
            </Stack>
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
              <LandingMenuButtons />
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

export default LandingNavbar;
