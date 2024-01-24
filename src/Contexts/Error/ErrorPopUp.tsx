import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

function ErrorPopUp({
  title = "There has been an error",
  content = "Unknown code",
  cancelText = "Close",
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
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
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

export default ErrorPopUp;
