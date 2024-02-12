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
  Button,
  useMediaQuery,
} from "@mui/material";

function MessagePage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [noRoomSelected, setNoRoomSelected] = useState(true);

  const chatRooms = [
    "ab",
    "cd",
    "ef",
    "xx",
    "yy",
    "zz",
    "aa",
    "bb",
    "cc",
    "dd",
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
          height: "91vh", // This will make the container take the full viewport height
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        {/* Chat List */}

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

          {/* Chat  */}

          <Paper
            sx={{
              width: "80%",
              // maxWidth: "80%",
            }}
            elevation={3}
          >
            {!noRoomSelected ? (
              <>
                <Box
                  sx={{
                    position: "absolute",
                    display: { xs: "flex", md: "none" },
                  }}
                >
                  <Button>ChatList</Button>
                  {/* Hide this chat Paper when the button is pressed and show the chat list stack instead  */}
                </Box>
                <Chat room={selectedRoom} />
              </>
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
