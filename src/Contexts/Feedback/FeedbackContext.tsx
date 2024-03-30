import React, { createContext, useContext, useState, ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Container } from "@mui/material";
import ErrorPopUp from "./ErrorPopUp";

/**
 * Defines the structure for the Feedback context props.
 */
export interface FeedbackContextType {
  showError: (title?: string, message?: string, cancelText?: string) => void;
  closeError: () => void;
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
  const [error, setError] = useState<{
    title?: string;
    message?: string;
    cancelText?: string;
  } | null>(null);
  const [isLoading, setLoading] = useState(false);

  const showError = (title?: string, message?: string, cancelText?: string) => {
    setError({ title, message, cancelText });
  };

  const closeError = () => {
    setError(null);
  };

  return (
    <FeedbackContext.Provider
      value={{ showError, closeError, isLoading, setLoading }}
    >
      {children}
      {isLoading && (
        <Container
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            minWidth: "100%",
            height: "100%",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(5px)",
          }}
        >
          <CircularProgress size={50} />
        </Container>
      )}
      <ErrorPopUp
        title={error ? error.title : "Error"}
        content={error ? error.message : "Unknown error"}
        cancelText={error ? error.cancelText : "Close"}
        error={error}
        onClose={closeError}
      />
    </FeedbackContext.Provider>
  );
};
