import React, { createContext, useContext, useState, ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Alert, Backdrop, Snackbar } from "@mui/material";
import DialogPopUp from "./DialogPopUp";

/**
 * Defines the structure for the Feedback context props.
 */
export interface FeedbackContextType {
  showDialog: (
    title?: string,
    message?: string,
    cancelText?: string,
    type?: "primary" | "secondary" | "error" | "inherit"
  ) => void;
  showSnackbar: (
    message: string,
    severity: "error" | "warning" | "info" | "success"
  ) => void;
  isLoading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Creates a new React context for managing feedback (error and loading states).
 */
const FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined
);

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
export const FeedbackProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [popUp, setPopUp] = useState<{
    title?: string;
    message?: string;
    cancelText?: string;
    type?: string;
  } | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    severity: "error" | "warning" | "info" | "success";
  } | null>(null);
  const showDialog = (
    title?: string,
    message?: string,
    cancelText?: string,
    type?: string
  ) => {
    setPopUp({ title, message, cancelText, type });
  };

  const showSnackbar = (
    message: string,
    severity: "error" | "warning" | "info" | "success"
  ) => {
    setSnackbar({ message, severity });
  };

  const closePopup = () => {
    setPopUp(null);
  };

  return (
    <FeedbackContext.Provider
      value={{ showDialog, showSnackbar, isLoading, setLoading }}
    >
      {children}

      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backdropFilter: "blur(5px)",
        }}
        open={isLoading}
      >
        <CircularProgress />
      </Backdrop>

      <DialogPopUp
        title={popUp ? popUp.title : "Error"}
        content={popUp ? popUp.message : "Unknown error"}
        cancelText={popUp ? popUp.cancelText : "Close"}
        type={popUp ? popUp.type : "inherit"}
        error={popUp}
        onClose={closePopup}
      />

      <Snackbar
        open={!!snackbar}
        autoHideDuration={5000}
        // @ts-expect-error
        onClose={setSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          // @ts-expect-error
          onClose={setSnackbar}
          severity={snackbar ? snackbar.severity : "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar ? snackbar.message : ""}
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
};
