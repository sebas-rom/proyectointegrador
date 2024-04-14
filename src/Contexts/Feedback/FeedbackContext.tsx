import React, { createContext, useContext, useState, ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Alert, Backdrop, Button, Snackbar } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

/**
 * Defines the structure for the Feedback context props.
 */
export interface FeedbackContextType {
  showDialog: (
    title?: string,
    message?: string,
    cancelText?: string,
    color?: "primary" | "secondary" | "error" | "inherit",
  ) => void;
  showSnackbar: (
    message: string,
    severity: "error" | "warning" | "info" | "success",
    horizontalPosition?: "left" | "center" | "right",
    verticalPosition?: "top" | "bottom",
    autoHide?: boolean,
  ) => void;
  isLoading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Creates a new React context for managing feedback (error and loading states).
 */
const FeedbackContext = createContext<FeedbackContextType | undefined>(undefined);

/**
 * A custom hook to provide access to the FeedbackContext.
 * @throws Will throw an error if `useFeedback` is used outside of a `FeedbackProvider`.
 * @returns {@link FeedbackContextType} The context with the ability to manage error and loading states.
 */
export const useFeedback = (): FeedbackContextType => {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error("useFeedback must be used within a FeedbackProvider");
  }

  return context;
};

/**
 * The provider component for the FeedbackContext which wraps the application or components inside.
 *
 * @param children - The child component(s) that will be wrapped by the `FeedbackProvider`.
 * @returns A context provider that manages error and loading states.
 */
export const FeedbackProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  // State for the dialog popup
  const [popUp, setPopUp] = useState<{
    title?: string;
    message?: string;
    cancelText?: string;
    type?: string;
  } | null>(null);

  // State for the loading indicator
  const [isLoading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // State for the snackbar
  const [snackbar, setSnackbar] = useState<{
    message: string;
    severity: "error" | "warning" | "info" | "success";
    horizontalPosition?: "left" | "center" | "right";
    verticalPosition?: "top" | "bottom";
    autoHide?: boolean;
  } | null>(null);

  // Function to display a dialog popup
  const showDialog = (title?: string, message?: string, cancelText?: string, type?: string) => {
    setShowPopup(true);
    setPopUp({
      title,
      message,
      cancelText,
      type,
    });
  };

  // Function to display a snackbar
  const showSnackbar = (
    message: string,
    severity: "error" | "warning" | "info" | "success",
    horizontalPosition: "left" | "center" | "right" = "center",
    verticalPosition: "top" | "bottom" = "bottom",
    autoHide: boolean = true,
  ) => {
    setOpenSnackbar(true);

    setSnackbar({
      message,
      severity,
      horizontalPosition,
      verticalPosition,
      autoHide,
    });
  };

  // Function to close the snackbar
  const closeSnackBar = (
    //@ts-expect-error ignored event
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  // Function to close the dialog popup
  const closeDialogPopup = () => {
    setShowPopup(false);
  };

  return (
    <FeedbackContext.Provider
      value={{
        showDialog,
        showSnackbar,
        isLoading,
        setLoading,
      }}
    >
      {/* Render the child components */}
      {children}

      {/* Render the backdrop with loading indicator */}
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: 9999,
          backdropFilter: "blur(5px)",
        }}
        open={isLoading}
      >
        <CircularProgress />
      </Backdrop>

      {/* Render the popUp dialog */}
      <Dialog
        open={showPopup}
        onClose={closeDialogPopup}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" color={popUp ? popUp.type : "inherit"}>
          {popUp ? popUp.title : "Alert"}
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="alert-dialog-description">{popUp ? popUp.message : "Unknown aler"}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialogPopup} autoFocus>
            {popUp ? popUp.cancelText : "Close"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Render the snackbar */}
      <Snackbar
        open={openSnackbar}
        {...(snackbar?.autoHide && {
          autoHideDuration: 5000,
        })}
        onClose={closeSnackBar}
        anchorOrigin={{
          vertical: snackbar ? snackbar.verticalPosition : "bottom",
          horizontal: snackbar ? snackbar.horizontalPosition : "center",
        }}
      >
        <Alert
          onClose={closeSnackBar}
          severity={snackbar ? snackbar.severity : "success"}
          variant="filled"
          sx={{
            width: "100%",
          }}
        >
          {snackbar ? snackbar.message : ""}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
};
