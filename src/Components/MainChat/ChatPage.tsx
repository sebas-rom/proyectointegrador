// import React from "react";
// import Channel from "../MainChat/Channel";
import { useState } from "react";
import Chat from "./Chat.tsx";
import {
  List,
  ListItemText,
  Box,
  Paper,
  ListItemButton,
  Stack,
  Divider,
} from "@mui/material";
// import { FindPeople } from "../FindPeople.tsx";
function ChatPage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [noRoomSelected, setNoRoomSelected] = useState(true);

  const chatRooms = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
  ];

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

export default ChatPage;
