import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

/**
 * ErrorPopUp component that renders a dialog popup to show error messages to users.
 * It renders only when there is an error, and it can be closed manually.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.title="There has been an error"] - The title of the dialog.
 * @param {string} [props.content="Unknown code"] - The content or message of the dialog to display.
 * @param {string} [props.cancelText="Close"] - The cancel button text.
 * @param {Object} [props.error] - The error object to determine if the dialog should be shown.
 * @param {Function} [props.onClose] - Callback function to be called when the dialog is closed.
 */
function DialogPopUp({
  title = "There has been an error",
  content = "Unknown code",
  cancelText = "Close",
  type = "none",
  error,
  onClose,
}) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Show the popup when there is an error
    if (error) {
      setShowPopup(true);
    }
  }, [error]);

  const closePopup = () => {
    setShowPopup(false);
    if (onClose) {
      onClose(); // Notify the parent component that the popup is closed
    }
  };

  return (
    <Dialog
      open={showPopup}
      onClose={closePopup}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title" color={type}>
        {title}
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {content}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={closePopup} autoFocus>
          {cancelText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DialogPopUp;
