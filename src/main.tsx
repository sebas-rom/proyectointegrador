import React from "react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { i18next } from "./Contexts/Lang/i18next.tsx";
import { ThemeContextProvider } from "./Theming/ThemeContext.tsx";
import { ErrorProvider } from "./Contexts/Error/ErrorContext.tsx";
import { LoadingProvider } from "./Contexts/Loading/LoadingContext.tsx";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <ThemeContextProvider>
        <ErrorProvider>
          <LoadingProvider>
            <App />
          </LoadingProvider>
        </ErrorProvider>
      </ThemeContextProvider>
    </I18nextProvider>
  </React.StrictMode>
);
