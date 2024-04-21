import { Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import React from "react";
import { UserData, createNewChat, sendMessageToChat } from "../../Contexts/Session/Firebase";
import { useFeedback } from "../../Contexts/Feedback/FeedbackContext";
import { useNavigate } from "react-router-dom";
import { MESSAGES_PATH } from "../Routes/routes";

/**
 * Interface for component props
 */
export interface CheckoutProps {
  /** State to control the dialog open/close */
  open: boolean;
  /** Function to handle dialog close */
  handleClose: () => void;
  user: UserData;
}

const SendMessageToDialog: React.FC<CheckoutProps> = ({ open, handleClose, user }) => {
  const [message, setMessage] = React.useState("");
  const [chatAlreadyExists, setChatAlreadyExists] = React.useState(false);
  const [alreadyExistsChatId, setAlreadyExistsChatId] = React.useState("");
  const navigate = useNavigate();
  const { setLoading } = useFeedback();

  /**
   * Sends a message to the selected user.
   */
  const sendMessage = async () => {
    try {
      setLoading(true);
      const newChatRoom = await createNewChat(user.uid);
      const newChatRoomId = newChatRoom[0];
      const isNewChatRoomNew = newChatRoom[1];
      if (isNewChatRoomNew) {
        await sendMessageToChat(newChatRoomId, message, "chat-started");
        handleClose();
        navigate(`/${MESSAGES_PATH}/${newChatRoomId}`);
      } else {
        setChatAlreadyExists(true);
        setAlreadyExistsChatId(newChatRoomId);
      }
    } catch (error) {
      console.error("Error setting loading state:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Redirects to the chat room that already exists.
   */
  const goToChatAlreadyExists = () => {
    navigate(`/${MESSAGES_PATH}/${alreadyExistsChatId}`);
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        Send a Message request to {user && user.firstName + " " + user.lastName}
      </DialogTitle>
      <DialogContent>
        <TextField
          id="outlined-multiline-static"
          multiline
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
        />
      </DialogContent>

      {chatAlreadyExists && (
        <Alert severity="error">
          <AlertTitle>Error</AlertTitle>
          You Already have a chat with this user
          <Button
            variant="contained"
            sx={{
              marginLeft: 2,
            }}
            onClick={goToChatAlreadyExists}
          >
            Go to chat
          </Button>
        </Alert>
      )}

      {!chatAlreadyExists && (
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={sendMessage}>Send Message</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default SendMessageToDialog;
