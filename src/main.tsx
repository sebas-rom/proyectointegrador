import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App.tsx";
import { I18nextProvider } from "react-i18next";
import { i18next } from "./Lang/i18next.tsx";
import { ThemeContextProvider } from "./Theming/ThemeContext.tsx";
import { initLang } from "./Lang/langSupport.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./Routes/LoginPage.tsx";
import LandingPage from "./Routes/LandingPage.tsx";
import SignupPage from "./Routes/SignupPage.tsx";
import Dashboard from "./Routes/Dashboard.tsx";
import { SessionProvider } from "./Session/SessionContext.tsx";

// initLang();

let currentBaseName = "";
if (import.meta.env.MODE === "development") {
  currentBaseName = "/";
} else {
  currentBaseName = "/ProyectoIntegrador";
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/signup",
      element: <SignupPage />,
    },
    {
      path: "/dashboard",
      element: (
        <SessionProvider>
          <Dashboard />
        </SessionProvider>
      ),
    },
  ],
  {
    basename: currentBaseName,
  }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <ThemeContextProvider>
        <RouterProvider router={router} />
        <h1>Footer</h1>
      </ThemeContextProvider>
    </I18nextProvider>
  </React.StrictMode>
);
