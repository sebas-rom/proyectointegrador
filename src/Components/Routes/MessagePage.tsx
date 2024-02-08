import { useState } from "react";
import Chat from "../MainChat/Chat.tsx";
import {
  List,
  ListItemText,
  Box,
  Paper,
  ListItemButton,
  Stack,
  Divider,
} from "@mui/material";

function MessagePage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [noRoomSelected, setNoRoomSelected] = useState(true);

  const chatRooms = ["ab", "cd", "ef"];

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setNoRoomSelected(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          height: "80vH",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        {/* Chat List Drawer */}

        <Stack
          direction="row"
          spacing={2}
          width={"100%"}
          sx={{ padding: "10px" }}
        >
          <Paper sx={{ width: "20%", height: "100%", overflow: "auto" }}>
            <List>
              {chatRooms.map((room) => (
                <div key={room}>
                  <ListItemButton
                    onClick={() => handleRoomSelect(room)}
                    selected={selectedRoom === room}
                  >
                    <ListItemText primary={`Chat Room ${room}`} />
                  </ListItemButton>
                  <Divider orientation="horizontal" />
                </div>
              ))}
            </List>
          </Paper>

          {/* Chat Container */}

          <Paper
            sx={{
              width: "80%",
              maxWidth: "80%",
              height: "100%",
            }}
            elevation={3}
          >
            {!noRoomSelected ? (
              <Chat room={selectedRoom} />
            ) : (
              <p>Please select a chat room.</p>
            )}
          </Paper>
        </Stack>
      </Box>
    </>
  );
}

export default MessagePage;
