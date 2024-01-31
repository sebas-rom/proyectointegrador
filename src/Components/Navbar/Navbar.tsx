import { useState } from "react";
// import LogoWhite from "../../assets/svg/logo-white.svg";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Stack,
  Drawer,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PageSettingsDrawer from "./PageSettingsDrawer.tsx";
import { Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";
import "./navbar.css";
import PageSettings from "./PageSettings.tsx";

function Navbar() {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  // const { t: lang } = useTranslation("home");
  // const sections = [
  //   lang("work"),
  //   lang("about"),
  //   lang("testimonials"),
  //   lang("contact"),
  // ];
  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="h6">AppName</Typography>
            <Link to="/dashboard">
              {/* <img src={LogoWhite} alt="Logo White" height="40" /> */}
            </Link>
          </Stack>

          <Box
            sx={{
              flexGrow: 1,
              justifyContent: "flex-end",
              display: { xs: "flex", md: "none" },
            }}
          >
            <IconButton
              size="large"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={() => setIsMenuDrawerOpen(true)}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>
          <Drawer
            anchor="right"
            open={isMenuDrawerOpen}
            onClose={() => setIsMenuDrawerOpen(false)}
          >
            <Box
              sx={{
                height: "100%",
                padding: 4,
              }}
            >
              <Stack
                direction={"row"}
                alignItems={"center"}
                justifyContent={"flex-end"}
              >
                <IconButton onClick={() => setIsMenuDrawerOpen(false)}>
                  <CloseIcon />
                </IconButton>
              </Stack>
              <Stack
                direction="column"
                justifyContent="space-between"
                spacing={2}
                // sx={{
                //   height: "90%",
                // }}
              >
                <PageSettings />
              </Stack>
            </Box>
          </Drawer>
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
              {/* {sections.map((section) => (
                <div className="navbarButtons">
                  <Button key={section} variant="text" color="inherit">
                    {section}
                  </Button>
                </div>
              ))} */}

              <PageSettingsDrawer />
            </Stack>
          </Box>
        </Toolbar>
      </AppBar>
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