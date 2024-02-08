import { useState } from "react";
import { AppBar, Toolbar, Typography, Box, Stack, Button } from "@mui/material";
import PageSettingsDrawer from "./PageSettingsDrawer.tsx";
import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
import "./navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const gotoDashboard = () => {
    navigate("/dashboard");
  };
  const gotoMessages = () => {
    navigate("/messages");
  };

  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
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
            <Typography variant="h6">AppName</Typography>
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
              <Stack>
                <Button>Hello</Button>
                <Button>Hello</Button>
                <Button>Hello</Button>
                <Button>Hello</Button>
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
              <Button
                variant="contained"
                disableElevation
                onClick={gotoDashboard}
              >
                Dashboard
              </Button>
              <Button
                variant="contained"
                disableElevation
                onClick={gotoMessages}
              >
                Messages
              </Button>
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
