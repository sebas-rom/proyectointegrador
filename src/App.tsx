import {
  // createBrowserRouter,
  createHashRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import LoginPage from "./Components/Routes/LoginPage.tsx";
import { SessionProvider } from "./Contexts/Session/SessionContext.tsx";
import { lazy, Suspense } from "react";
import MyAccount from "./Components/Routes/MyAccount.tsx";
import MessagePage from "./Components/Routes/MessagePage.tsx";
import { Navbar } from "./Components/Navbar/Navbar.tsx";
const Dashboard = lazy(() => import("./Components/Routes/Dashboard.tsx"));
const LandingPage = lazy(() => import("./Components/Routes/LandingPage.tsx"));
const SignupPage = lazy(() => import("./Components/Routes/SignupPage.tsx"));

const Navbar_Footer_Layout = () => (
  <SessionProvider>
    <Navbar />
    <Outlet /> {/* Nested routes will render here */}
    <h1>Footer</h1>
  </SessionProvider>
);

const Navbar_Layout = () => (
  <SessionProvider>
    <Navbar />
    <Outlet /> {/* Nested routes will render here */}
  </SessionProvider>
);

const router = createHashRouter(
  [
    {
      path: "/",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <LandingPage />
        </Suspense>
      ),
    },
    {
      path: "/login",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <LoginPage />
        </Suspense>
      ),
    },
    {
      path: "/signup",
      element: (
        <Suspense fallback={<div>Loading...</div>}>
          <SignupPage />
        </Suspense>
      ),
    },
    {
      path: "/",
      element: <Navbar_Footer_Layout />,
      children: [
        {
          path: "dashboard",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <Dashboard />
            </Suspense>
          ),
        },
        {
          path: "account",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <MyAccount />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: "/",
      element: <Navbar_Layout />,
      children: [
        {
          path: "messages",
          element: (
            <Suspense fallback={<div>Loading...</div>}>
              <MessagePage />
            </Suspense>
          ),
        },
      ],
    },
  ],
  {
    // basename: "/proyectointegrador",
  }
);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
