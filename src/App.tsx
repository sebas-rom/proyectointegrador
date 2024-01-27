import {
  // createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import LoginPage from "./Components/Routes/LoginPage.tsx";
// import LandingPage from "./Routes/LandingPage.tsx";
// import SignupPage from "./Routes/SignupPage.tsx";
// import Dashboard from "./Routes/Dashboard.tsx";
import { SessionProvider } from "./Contexts/Session/SessionContext.tsx";
import { lazy, Suspense } from "react";
import MyAccount from "./Components/Routes/MyAccount.tsx";
const Dashboard = lazy(() => import("./Components/Routes/Dashboard.tsx"));
const LandingPage = lazy(() => import("./Components/Routes/LandingPage.tsx"));
const SignupPage = lazy(() => import("./Components/Routes/SignupPage.tsx"));
const router = createHashRouter(
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
    {
      path: "/account",
      element: (
        <Suspense>
          <SessionProvider>
            <MyAccount />
          </SessionProvider>
        </Suspense>
      ),
    },
  ],
  {
    // basename: "/proyectointegrador",
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
