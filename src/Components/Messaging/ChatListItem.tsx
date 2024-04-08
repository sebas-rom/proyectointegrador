import React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ColoredAvatar from "../DataDisplay/ColoredAvatar";
import { format } from "date-fns";

function ChatListItem({ detail, selectedRoom, handleRoomSelect }) {
  return (
    <ListItemButton
      onClick={() => handleRoomSelect(detail.chatRoom)}
      selected={selectedRoom === detail.chatRoom}
      sx={{
        borderRadius: "5px",
        margin: "5px",
      }}
    >
      <Stack
        direction={"row"}
        spacing={2}
        height={"100%"}
        width={"100%"}
        justifyContent="flex-start"
        alignItems="center"
      >
        <ColoredAvatar
          userName={detail.otherUserName}
          size="medium"
          photoURL={detail.otherPhotoURL}
        />

        <Stack flexGrow={1}>
          <Stack direction={"row"} justifyContent="space-between">
            <Typography
              variant="body1"
              sx={{
                fontWeight: !detail.lastMessageRead ? "bold" : "normal",
              }}
            >
              {detail.otherUserName}
            </Typography>

            {detail.lastMessageTime && (
              <Typography
                variant="body2"
                color={detail.lastMessageRead ? "textSecondary" : "primary"}
                sx={{
                  fontWeight: !detail.lastMessageRead ? "bold" : "normal",
                }}
              >
                {/* use utils - show weekday */}
                {format(
                  new Date(detail.lastMessageTime.seconds * 1000),
                  "h:mm a"
                )}
              </Typography>
            )}
          </Stack>
          <Box
            sx={{
              height: "40px",
              width: "100%",
              overflow: "hidden",
            }}
          >
            <Typography
              variant="body2"
              color="textSecondary"
              textOverflow={"ellipsis"}
              overflow={"hidden"}
              sx={{
                fontWeight: !detail.lastMessageRead ? "bold" : "normal",
              }}
            >
              {detail.lastMessageSenderName +
                (detail.lastMessageType === "file"
                  ? " sent a file"
                  : detail.lastMessageType === "contract"
                  ? " sent a contract"
                  : detail.lastMessageType === "chat-started"
                  ? " started a chat"
                  : detail.lastMessageType === "text"
                  ? " " + detail.lastMessage
                  : " " + detail.lastMessage)}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </ListItemButton>
  );
}

export default ChatListItem;
