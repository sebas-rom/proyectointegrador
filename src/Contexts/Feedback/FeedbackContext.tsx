import React, { createContext, useContext, useState, ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Backdrop, Container, Dialog } from "@mui/material";
import ErrorPopUp from "./ErrorPopUp";
import DialogPopUp from "./DialogPopUp";

/**
 * Defines the structure for the Feedback context props.
 */
export interface FeedbackContextType {
  showDialog: (
    title?: string,
    message?: string,
    cancelText?: string,
    type?: string
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

  const showDialog = (
    title?: string,
    message?: string,
    cancelText?: string,
    type?: string
  ) => {
    setPopUp({ title, message, cancelText, type });
  };

  const closePopup = () => {
    setPopUp(null);
  };

  return (
    <FeedbackContext.Provider value={{ showDialog, isLoading, setLoading }}>
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
    </FeedbackContext.Provider>
  );
};
