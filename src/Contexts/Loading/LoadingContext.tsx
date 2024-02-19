import React, { createContext, useContext, useState, ReactNode } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Container } from "@mui/material";

/**
 * Defines the structure for the Loading context props.
 */
export interface LoadingContextProps {
  isLoading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Creates a new React context for managing loading states.
 */
const LoadingContext = createContext<LoadingContextProps | undefined>(
  undefined
);

/**
 * The provider component for the LoadingContext which wraps the application or components inside.
 *
 * @param children - The child component(s) that will be wrapped by the `LoadingProvider`.
 * @returns A context provider that shows a loading spinner overlay when `isLoading` is `true`.
 */
export const LoadingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
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
      {children}
    </LoadingContext.Provider>
  );
};

/**
 * A custom hook to provide access to the LoadingContext.
 * @throws Will throw an error if `useLoading` is used outside of a `LoadingProvider`.
 * @returns {@link LoadingContextProps} The context with the ability to check the loading state and set it.
 */
export const useLoading = (): LoadingContextProps => {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }

  return context;
};
