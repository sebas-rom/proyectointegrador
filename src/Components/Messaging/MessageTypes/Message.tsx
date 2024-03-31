import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { auth } from "../../../Contexts/Session/Firebase.tsx";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar.tsx";

/**
 * Interface for Message component props
 */
export interface MessageProps {
  id?: string;
  createdAt?: { seconds: number } | null;
  text?: string;
  userName?: string;
  photoURL?: string | null;
  uid?: string;
  // type?: "text" | "file";
}

/**
 * Message component that renders an individual chat message.
 *
 * @param {MessageProps} props - The props for the message component.
 * @returns A React functional component that returns the message UI or null if no message text is provided.
 * @component
 */
const Message: React.FC<MessageProps> = ({
  createdAt = null,
  text = "",
  userName = "",
  photoURL = null,
  uid = "",
}) => {
  const [formattedDate, setFormattedDate] = useState(null);
  useEffect(() => {
    setFormattedDate(
      format(
        createdAt?.seconds ? new Date(createdAt.seconds * 1000) : null,
        "h:mm a"
      )
    );
  }, []);

  const isOwnMessage = uid === auth.currentUser?.uid;
  // Split text into lines
  const messageLines = text.split("\n");

  return (
    <Stack
      direction={isOwnMessage ? "row" : "row-reverse"}
      marginBottom={1}
      justifyContent="flex-end"
      alignItems={"center"}
    >
      <Stack direction="column" sx={{ maxWidth: "70%" }}>
        <Paper
          sx={{
            padding: "6px",
            borderRadius: 2,
          }}
        >
          {userName && (
            <Typography
              variant="body1"
              color="primary"
              textAlign={isOwnMessage ? "right" : "left"}
            >
              {userName}
            </Typography>
          )}
          <Stack
            alignItems={isOwnMessage ? "flex-end" : "flex-start"}
            justifyContent={"space-between"}
          >
            {messageLines.map((line, index) => (
              <Typography key={index} variant="body1">
                {line}
              </Typography>
            ))}
            <Typography
              variant="body2"
              color="textSecondary"
              align="right"
              fontSize={11}
            >
              {formattedDate ? formattedDate : "h:mm a"}
            </Typography>
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
