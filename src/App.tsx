import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { SessionProvider } from "./Contexts/Session/SessionContext.tsx";
import { lazy, Suspense } from "react";
import { Navbar } from "./Components/PageLayout/Navbar/Navbar.tsx";
import Footer from "./Components/PageLayout/Footer/Footer.tsx";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import paypalid from "./Secrets/paypal-id.json";

const LoginPage = lazy(() => import("./Components/Routes/Public/LoginPage.tsx"));
const PageNotFound = lazy(() => import("./Components/Routes/Public/PageNotFound.tsx"));
const Dashboard = lazy(() => import("./Components/Routes/Session/Dashboard.tsx"));
const LandingPage = lazy(() => import("./Components/Routes/Public/LandingPage.tsx"));
const SignupPage = lazy(() => import("./Components/Routes/Public/SignupPage.tsx"));
const MessagePage = lazy(() => import("./Components/Routes/Session/MessagePage.tsx"));
const MyAccount = lazy(() => import("./Components/Routes/Session/MyAccount.tsx"));
const FindPeople = lazy(() => import("./Components/Routes/Session/FindPeople.tsx"));
const TermsAndConditions = lazy(() => import("./Components/Routes/Public/TermsAndConditions.tsx"));
const PrivacyPolicy = lazy(() => import("./Components/Routes/Public/PrivacyPolicy.tsx"));
const ProposeContract = lazy(() => import("./Components/Routes/Session/ProposeContract.tsx"));
const CompleteSignUp = lazy(() => import("./Components/Routes/Session/CompleteSignUp.tsx"));
const ViewContract = lazy(() => import("./Components/Routes/Session/ViewContract.tsx"));
const ProposeNewMilestones = lazy(() => import("./Components/Routes/Session/ProposeNewMilestones.tsx"));
const ViewProfile = lazy(() => import("./Components/Routes/Session/ViewProfile.tsx"));
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
const Only_Footer_Layout = () => (
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
    element: <Only_Footer_Layout />,
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
      {
        path: "terms-and-conditions",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <TermsAndConditions />
          </Suspense>
        ),
      },
      {
        path: "privacy-policy",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <PrivacyPolicy />
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
      {
        path: "propose-contract/:contractId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProposeContract />
          </Suspense>
        ),
      },
      {
        path: "propose-new-milestones/:contractId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProposeNewMilestones />
          </Suspense>
        ),
      },
      {
        path: "view-contract/:contractId",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ViewContract />
          </Suspense>
        ),
      },
      {
        path: "view-profile/:profileUID",
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ViewProfile />
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
    path: "/complete-signup",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <SessionProvider>
          <CompleteSignUp />
        </SessionProvider>
      </Suspense>
    ),
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

const paypalOptions = {
  clientId: paypalid["client-id"],
  currency: "USD",
  intent: "capture",
};

/**
 * App is the root component of the application containing the RouterProvider.
 * This sets up the router context created by `createHashRouter`.
 */
function App() {
  return (
    <PayPalScriptProvider options={paypalOptions}>
      <RouterProvider router={router} />
    </PayPalScriptProvider>
  );
}

export default App;
