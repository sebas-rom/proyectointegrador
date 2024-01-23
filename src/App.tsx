import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./Routes/LoginPage.tsx";
import LandingPage from "./Routes/LandingPage.tsx";
import SignupPage from "./Routes/SignupPage.tsx";
import Dashboard from "./Routes/Dashboard.tsx";
import { SessionProvider } from "./Session/SessionContext.tsx";

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
function App() {
  return (
    <>
      <RouterProvider router={router} />
      <h1>Footer</h1>
    </>
  );
}

export default App;
