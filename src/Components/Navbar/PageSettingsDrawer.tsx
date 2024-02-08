import { ReactNode, useState } from "react";
import { Drawer, Button, IconButton, Stack, Box } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import "./navbar.css";
import PageSettings from "./PageSettings.tsx";
import MenuIcon from "@mui/icons-material/Menu";

type PageSettingsDrawerProps = {
  isMobile?: boolean;
  children?: ReactNode;
};

function PageSettingsDrawer({
  isMobile = false,
  children,
}: PageSettingsDrawerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      >
        <Box
          sx={{
            width: 400,
            padding: 4,
          }}
          height={"100%"}
        >
          <Stack spacing={2} sx={{ height: "100%" }}>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"flex-end"}
            >
              <IconButton onClick={() => setIsDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <PageSettings>{children}</PageSettings>
          </Stack>
        </Box>
      </Drawer>
      <Button
        variant="text"
        color="inherit"
        onClick={() => setIsDrawerOpen(true)}
      >
        {!isMobile ? <SettingsIcon /> : <MenuIcon />}
      </Button>
    </>
  );
}

export default PageSettingsDrawer;
