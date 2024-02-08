import React, { useMemo } from "react";
import { format } from "date-fns";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { auth } from "../../Contexts/Session/Firebase.tsx";
import ColoredAvatar from "../DataDisplay/ColoredAvatar.tsx";

export interface MessageProps {
  createdAt?: { seconds: number } | null;
  text?: string;
  userName?: string;
  photoURL?: string | null;
  uid?: string;
}

const Message: React.FC<MessageProps> = ({
  createdAt = null,
  text = "",
  userName = "",
  photoURL = null,
  uid = "",
}) => {
  if (!text) return null;

  const isOwnMessage = uid === auth.currentUser?.uid;

  // Memoized message date
  const messageDate = useMemo(() => {
    return createdAt?.seconds ? new Date(createdAt.seconds * 1000) : null;
  }, [createdAt]);

  return (
    <Stack
      direction={isOwnMessage ? "row" : "row-reverse"}
      marginBottom={1}
      justifyContent="flex-end"
      alignItems={"center"}
    >
      <Stack direction="column">
        <Paper
          sx={{
            padding: "6px",
            borderRadius: 2,
            // borderBottomLeftRadius: isOwnMessage ? 5 : 15,
            // borderTopRightRadius: isOwnMessage ? 5 : 15,
            // borderBottomRightRadius: !isOwnMessage ? 5 : 15,
            // borderTopLeftRadius: !isOwnMessage ? 5 : 15,
          }}
        >
          {userName && (
            <Typography variant="body1" color="primary">
              {userName}
            </Typography>
          )}
          <Stack
            direction={isOwnMessage ? "row" : "row-reverse"}
            // justifyContent={isOwnMessage ? "right" : "left"}
            alignItems="flex-end"
            justifyContent={"space-between"}
            spacing={3}
          >
            <Typography
              variant="body2"
              color="textSecondary"
              align="right"
              fontSize={11}
            >
              {messageDate && format(messageDate, "h:mm a")}
            </Typography>
            <Typography variant="body1">{text}</Typography>
          </Stack>
        </Paper>
      </Stack>
      <div
        style={{
          marginLeft: isOwnMessage ? "5px" : "10px",
          marginRight: isOwnMessage ? "10px" : "5px",
        }}
      >
        {photoURL !== "no-display" ? (
          <ColoredAvatar userName={userName} photoURL={photoURL} />
        ) : (
          <div
            style={{
              width: 45,
              height: 45,
            }}
          ></div>
        )}
      </div>
    </Stack>
  );
};

export default Message;
