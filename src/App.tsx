import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LoginPage from "./Routes/LoginPage.tsx";
// import LandingPage from "./Routes/LandingPage.tsx";
// import SignupPage from "./Routes/SignupPage.tsx";
// import Dashboard from "./Routes/Dashboard.tsx";
import { SessionProvider } from "./Session/SessionContext.tsx";
import { lazy, Suspense } from "react";
const Dashboard = lazy(() => import("./Routes/Dashboard"));
const LandingPage = lazy(() => import("./Routes/LandingPage"));
const SignupPage = lazy(() => import("./Routes/SignupPage"));
const router = createBrowserRouter(
  [
    {
      path: "/",
      element: (
        <Suspense>
          <LandingPage />
        </Suspense>
      ),
    },
    {
      path: "/login",
      element: (
        <Suspense>
          <LoginPage />
        </Suspense>
      ),
    },
    {
      path: "/signup",
      element: (
        <Suspense>
          <SignupPage />
        </Suspense>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <Suspense>
          <SessionProvider>
            <Dashboard />
          </SessionProvider>
        </Suspense>
      ),
    },
  ],
  {
    basename: "/proyectointegrador",
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
