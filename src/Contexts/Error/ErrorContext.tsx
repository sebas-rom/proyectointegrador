// ErrorContext.js
import React, { ReactNode, createContext, useContext, useState } from "react";
import ErrorPopUp from "./ErrorPopUp";

/**
 * Type definition for the context that holds error management functions.
 */
export interface ErrorContextType {
  showError: (title?: string, message?: string, cancelText?: string) => void;
  closeError: () => void;
}



/**
 * Error context object, holding functions to manage errors.
 */
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

/**
 * Custom hook to use the error context.
 * It ensures that the hook is called within a component wrapped with `ErrorProvider`.
 * Throws an Error if the context is not available.
 *
 * @return An object with the `showError` and `closeError` functions from the context.
 */
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};

/**
 * ErrorProviderProps defines properties for the ErrorProvider component.
 */
export interface ErrorProviderProps {
  children: ReactNode;
}

/**
 * The ErrorProvider component wraps its children and provides an ErrorContext for managing errors.
 * It includes the `ErrorPopUp` component that is conditionally displayed if an error is set.
 *
 * @param children - The child components to be wrapped within the ErrorProvider.
 */
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
