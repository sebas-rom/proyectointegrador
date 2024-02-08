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
import MessagePage from "./Components/Routes/MessagePage.tsx";
import { Navbar } from "./Components/Navbar/Navbar.tsx";
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
            <Navbar />
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
            <Navbar />
            <MyAccount />
          </SessionProvider>
        </Suspense>
      ),
    },
    {
      path: "/messages",
      element: (
        <Suspense>
          <SessionProvider>
            <Navbar />
            <MessagePage />
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
