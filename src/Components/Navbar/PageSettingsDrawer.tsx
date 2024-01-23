import { useState } from "react";
import { Drawer, Button, IconButton, Stack, Box } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import "./navbar.css";
import PageSettings from "./PageSettings.tsx";

function PageSettingsDrawer() {
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
        >
          <Stack spacing={2}>
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"space-between"}
            >
              <IconButton onClick={() => setIsDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <PageSettings />
          </Stack>
        </Box>
      </Drawer>
      <Button
        variant="text"
        color="inherit"
        onClick={() => setIsDrawerOpen(true)}
      >
        <SettingsIcon />
      </Button>
    </>
  );
}

export default PageSettingsDrawer;
