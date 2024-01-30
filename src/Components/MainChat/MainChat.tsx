// import React from "react";
// import Channel from "../MainChat/Channel";
import { useState } from "react";
import { Chat } from "./Chat.tsx";
import {
  List,
  ListItem,
  ListItemText,
  Drawer,
  Container,
  Box,
  Paper,
  ListItemButton,
  Stack,
} from "@mui/material";
// import { FindPeople } from "../FindPeople.tsx";
function MainChat() {
  const [selectedRoom, setSelectedRoom] = useState("1");
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
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          height: "80vH",
          width: "100%",
          maxWidth: "100%",
          // margin: "10px",
        }}
      >
        {/* Chat List Drawer */}

        <Stack
          direction="row"
          spacing={2}
          width={"100%"}
          // justifyContent={"center"}
        >
          <Paper sx={{ width: "20%", height: "100%", overflow: "auto" }}>
            <List>
              {chatRooms.map((room) => (
                <ListItemButton
                  key={room}
                  onClick={() => handleRoomSelect(room)}
                  selected={selectedRoom === room}
                >
                  <ListItemText primary={`Chat Room ${room}`} />
                </ListItemButton>
              ))}
            </List>
          </Paper>

          {/* Chat Container */}

          <Paper
            sx={{
              width: "80%",
              maxWidth: "80%",
              height: "100%",
              overflow: "auto",
            }}
            elevation={3}
          >
            <Chat room={selectedRoom} />
          </Paper>
        </Stack>
      </Box>
    </>
  );
}

export default MainChat;
