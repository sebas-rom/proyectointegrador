import ReactDOM from "react-dom/client";
import { I18nextProvider } from "react-i18next";
import { i18next } from "./Contexts/Lang/i18next.tsx";
import { ThemeContextProvider } from "./Contexts/Theming/ThemeContext.tsx";
import App from "./App.tsx";
import { FeedbackProvider } from "./Contexts/Feedback/FeedbackContext.tsx";

/**
 * Mounts the main App component within the React StrictMode and various contexts like:
 * I18nextProvider, ThemeContextProvider, ErrorProvider, and LoadingProvider.
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <I18nextProvider i18n={i18next}>
    <ThemeContextProvider>
      <FeedbackProvider>
        <App />
      </FeedbackProvider>
    </ThemeContextProvider>
  </I18nextProvider>
  // </React.StrictMode>
);
