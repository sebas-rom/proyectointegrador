// ErrorContext.js
import React, { ReactNode, createContext, useContext, useState } from "react";
import ErrorPopUp from "./ErrorPopUp";

interface ErrorContextType {
  showError: (title?: string, message?: string, cancelText?: string) => void;
  closeError: () => void;
}

interface ErrorObject {
  title?: string;
  message?: string;
  cancelText?: string;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState(null);

  const showError = (title, message, cancelText) => {
    setError({ title, message, cancelText });
  };

  const closeError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ showError, closeError }}>
      {children}
      <ErrorPopUp
        title={error ? error.title : "Error"}
        content={error ? error.message : "Unknown error"}
        cancelText={error ? error.cancelText : "Close"}
        error={error}
        onClose={closeError}
      />
    </ErrorContext.Provider>
  );
};
