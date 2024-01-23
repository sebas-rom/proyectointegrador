import { useState } from "react";
import {
  Drawer,
  Button,
  IconButton,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import ChooseLang from "./ChooseLang.tsx";
import ChooseTheme from "./ChooseTheme.tsx";

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
              <Typography variant="h5">Settings</Typography>
              <IconButton onClick={() => setIsDrawerOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Stack>

            <Typography variant="subtitle1">Language</Typography>
            <ChooseLang />

            <Typography variant="subtitle1">Color Mode</Typography>
            <ChooseTheme />
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
