import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { SessionProvider } from "./Contexts/Session/SessionContext.tsx";
import { lazy, Suspense } from "react";
import { Navbar } from "./Components/Navbar/Navbar.tsx";
import Footer from "./Components/Other/Footer.tsx";

const LoginPage = lazy(() => import("./Components/Routes/LoginPage.tsx"));
const PageNotFound = lazy(() => import("./Components/Routes/PageNotFound.tsx"));
const Dashboard = lazy(() => import("./Components/Routes/Dashboard.tsx"));
const LandingPage = lazy(() => import("./Components/Routes/LandingPage.tsx"));
const SignupPage = lazy(() => import("./Components/Routes/SignupPage.tsx"));
const MessagePage = lazy(() => import("./Components/Routes/MessagePage.tsx"));
const MyAccount = lazy(() => import("./Components/Routes/MyAccount.tsx"));
const FindPeople = lazy(() => import("./Components/Routes/FindPeople.tsx"));

/**
 * The Navbar_Footer_Layout component wraps the navigation bar, footer and page content.
 * It is used to display the common layout for several routes in the application.
 */
const Navbar_Footer_Layout = () => (
  <SessionProvider>
    <Navbar />
    <Outlet />
    <Footer />
  </SessionProvider>
);

/**
 * The Navbar_Layout component wraps the navigation bar and page content.
 * It is used to display the common layout for several routes in the application,
 * without the footer present in the Navbar_Footer_Layout.
 */
const Navbar_Layout = () => (
  <SessionProvider>
    <Navbar />
    <Outlet />
  </SessionProvider>
);

/**
 * The No_Session_Layout component wraps the page content and footer.
 * It is used to display the common layout for several routes in the application,
 * without the navigation bar present in the Navbar_Footer_Layout.
 */
const No_Session_Layout = () => (
  <SessionProvider>
    <Outlet />
    <Footer />
  </SessionProvider>
);
/**
 * The router configuration for the app using a hash-based routing system.
 * It contains the definition of all routes and their corresponding components.
 * Suspense is used to add a loading state during code-splitting.
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <No_Session_Layout />,
    children: [
      {
        path: "",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LandingPage />
          </Suspense>
        ),
      },
      {
        path: "login",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: "signup",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SignupPage />
          </Suspense>
        ),
      },
    ],
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
      {
        path: "search-people",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <FindPeople />
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
      {
        path: "messages/:selectedRoomId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <MessagePage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <PageNotFound />
        <Footer />
      </Suspense>
    ),
  },
]);

/**
 * App is the root component of the application containing the RouterProvider.
 * This sets up the router context created by `createHashRouter`.
 */
function App() {
  return <RouterProvider router={router} />;
}

export default App;
