import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { SessionProvider } from "./Contexts/Session/SessionContext.tsx";
import { lazy, Suspense } from "react";
import { Navbar } from "./Components/PageLayout/Navbar/Navbar.tsx";
import Footer from "./Components/PageLayout/Footer/Footer.tsx";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import paypalid from "./Secrets/paypal-id.json";
import {
  ACCOUNT_PATH,
  COMPLETE_SIGNUP_PATH,
  DASHBOARD_PATH,
  LOGIN_PATH,
  MESSAGES_PATH,
  MY_BALANCE_PATH,
  PRIVACY_POLICY_PATH,
  PROPOSE_CONTRACT_PATH,
  PROPOSE_NEW_MILESTONES_PATH,
  SEARCH_PEOPLE_PATH,
  SIGNUP_PATH,
  TERMS_AND_CONDITIONS_PATH,
  VIEW_CONTRACT_PATH,
  VIEW_PROFILE_PATH,
} from "./Components/Routes/routes.tsx";

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
const MyBalance = lazy(() => import("./Components/Routes/Session/MyBalance.tsx"));
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
        path: `${LOGIN_PATH}`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: `${SIGNUP_PATH}`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SignupPage />
          </Suspense>
        ),
      },
      {
        path: `${TERMS_AND_CONDITIONS_PATH}`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <TermsAndConditions />
          </Suspense>
        ),
      },
      {
        path: `${PRIVACY_POLICY_PATH}`,
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
        path: `${DASHBOARD_PATH}`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: `${ACCOUNT_PATH}`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <MyAccount />
          </Suspense>
        ),
      },
      {
        path: `${SEARCH_PEOPLE_PATH}`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <FindPeople />
          </Suspense>
        ),
      },
      {
        path: `${PROPOSE_CONTRACT_PATH}/:contractId`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProposeContract />
          </Suspense>
        ),
      },
      {
        path: `${PROPOSE_NEW_MILESTONES_PATH}/:contractId`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ProposeNewMilestones />
          </Suspense>
        ),
      },
      {
        path: `${VIEW_CONTRACT_PATH}/:contractId`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ViewContract />
          </Suspense>
        ),
      },
      {
        path: `${VIEW_PROFILE_PATH}/:profileUID`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <ViewProfile />
          </Suspense>
        ),
      },
      {
        path: `${MY_BALANCE_PATH}`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <MyBalance />
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
        path: `${MESSAGES_PATH}`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <MessagePage />
          </Suspense>
        ),
      },
      {
        path: `${MESSAGES_PATH}/:selectedRoomId`,
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <MessagePage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: `/${COMPLETE_SIGNUP_PATH}`,
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
