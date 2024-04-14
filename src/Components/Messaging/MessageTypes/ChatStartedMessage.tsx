import { Button, Stack, Typography } from "@mui/material";
import {
  UserData,
  auth,
  getUserData,
  sendMessageToChat,
  updateChatRoomStatus,
} from "../../../Contexts/Session/Firebase.tsx";
import Message from "./Message.tsx";
import BorderText from "../../DataDisplay/BorderText.tsx";

/**
 * Represents a component for the first message on a new chat.
 * @param createdAt The date and time when the message was created.
 * @param text The content of the message.
 * @param userName The name of the user who sent the message.
 * @param photoURL The URL of the user's profile photo.
 * @param uid The unique identifier of the user who sent the message.
 * @param status The status of the chat room (pending, active, or declined).
 * @param chatRoomId The unique identifier of the chat room.
 */
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
  /**
   * Accept a chat request. Updates the chat room status to "active" and sends a status update message.
   */
  const handleAcceptRequest = async () => {
    await updateChatRoomStatus(chatRoomId, "active");
    const currentUserData = (await getUserData(auth.currentUser.uid)) as UserData;
    const statusText = currentUserData.firstName + " accepted the chat request";
    await sendMessageToChat(chatRoomId, statusText, "status-update");
  };

  /**
   * Decline a chat request. Updates the chat room status to "declined" and sends a status update message.
   */
  const handleDeclineRequest = async () => {
    updateChatRoomStatus(chatRoomId, "declined");
    const currentUserData = (await getUserData(auth.currentUser.uid)) as UserData;
    const statusText = currentUserData.firstName + " declined the chat request";
    await sendMessageToChat(chatRoomId, statusText, "status-update");
  };

  return (
    <>
      <Stack alignItems={"center"} spacing={2}>
        <Typography color={"textSecondary"}>{isOwnMessage ? "You" : userName} started a chat</Typography>
      </Stack>
      <Message createdAt={createdAt} text={text} userName={userName} photoURL={photoURL} uid={uid} />
      <Stack alignItems={"center"} spacing={2}>
        {!isOwnMessage && status === "pending" && (
          <Stack direction={"row"} spacing={2}>
            <Button variant="outlined" onClick={handleAcceptRequest}>
              Accept Request
            </Button>
            <Button variant="outlined" color="error" onClick={handleDeclineRequest}>
              Decline
            </Button>
          </Stack>
        )}
        {!isOwnMessage && status === "declined" && (
          <Stack spacing={2} alignItems={"center"}>
            <Typography color={"textSecondary"}>
              You declined this chat, {userName} will not be able to message you until you accept
            </Typography>
            <Button variant="outlined" onClick={handleAcceptRequest}>
              Accept Request
            </Button>
          </Stack>
        )}

        {isOwnMessage && status === "pending" && (
          <>
            <BorderText color="warning" text="Waiting for response" />
            <Typography color={"textSecondary"}>You can start sending messages once the request is accepted</Typography>
          </>
        )}
        {isOwnMessage && status === "declined" && <BorderText color="error" text="Request Declined" />}
        {status === "active" && <BorderText color="succes" text="Request accepted" />}
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
