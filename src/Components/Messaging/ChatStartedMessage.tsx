import { Button, Stack, Typography } from "@mui/material";
import {
  auth,
  updateChatRoomStatus,
} from "../../Contexts/Session/Firebase.tsx";
import Message from "./Message.tsx";
import BorderText from "../@extended/BorderText.tsx";

const NewChatMessage = ({
  createdAt = null,
  text = "",
  userName = "",
  photoURL = null,
  uid = "",
  status = "pending",
  chatRoomId = "",
}) => {
  const isOwnMessage = uid === auth.currentUser?.uid;
  const handleAcceptRequest = () => {
    updateChatRoomStatus(chatRoomId, "active");
  };
  const handleDeclineRequest = () => {
    updateChatRoomStatus(chatRoomId, "declined");
  };
  return (
    <>
      <Stack alignItems={"center"} spacing={2}>
        <Typography color={"textSecondary"}>
          {isOwnMessage ? "You" : userName} started a chat
        </Typography>
      </Stack>
      <Message
        createdAt={createdAt}
        text={text}
        userName={userName}
        photoURL={photoURL}
        uid={uid}
      />
      <Stack alignItems={"center"} spacing={2}>
        {!isOwnMessage && status === "pending" && (
          <Stack direction={"row"} spacing={2}>
            <Button variant="outlined" onClick={handleAcceptRequest}>
              Accept Request
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDeclineRequest}
            >
              Decline
            </Button>
          </Stack>
        )}
        {!isOwnMessage && status === "declined" && (
          <Stack spacing={2} alignItems={"center"}>
            <Typography color={"textSecondary"}>
              You declined this chat, {userName} will not be able to message you
              until you accept
            </Typography>
            <Button variant="outlined" onClick={handleAcceptRequest}>
              Accept Request
            </Button>
          </Stack>
        )}

        {isOwnMessage && status === "pending" && (
          <>
            <BorderText color="warning" text="Waiting for response" />
            <Typography color={"textSecondary"}>
              You can start sending messages once the request is accepted
            </Typography>
          </>
        )}
        {isOwnMessage && status === "declined" && (
          <BorderText color="error" text="Request Declined" />
        )}
        {status === "active" && (
          <BorderText color="succes" text="Request accepted" />
        )}
        {isOwnMessage && status === "declined" && (
          <Typography color={"textSecondary"}>
            This request was declined, you will not be able to send messages
          </Typography>
        )}
        <div />
      </Stack>
    </>
  );
};

export default NewChatMessage;
