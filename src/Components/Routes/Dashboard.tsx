// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Channel from "../MainChat/Channel.tsx";
import { isSignUpCompleted } from "../../Contexts/Session/Firebase.tsx";
import { Suspense, lazy, useEffect, useState } from "react";

const CompleteSignUp = lazy(() => import("../AccountEdit/CompleteSignUp.tsx"));

/**
 * The Dashboard component is the main container for user interaction after login.
 * It checks if the sign-up process has been completed and conditionally renders the
 * CompleteSignUp component if necessary.
 *
 * The CompleteSignUp component is loaded lazily for performance optimization.
 * This component also provides a loading state fallback while waiting for the CompleteSignUp
 * component to load. If the sign-up is already completed, additional components, such as Navbar,
 * might be rendered in future versions.
 */
const Dashboard = () => {
  const [SignupCompleted, setSignupCompleted] = useState(true);

  /**
   * Function that checks the sign-up completion status by calling the `signUpCompleted` method
   * from Firebase context. It updates the `SignupCompleted` state accordingly.
   */
  const checkSignUpCompleted = async () => {
    const isCompleted = await isSignUpCompleted();
    setSignupCompleted(isCompleted);
  };

  useEffect(() => {
    checkSignUpCompleted();
  }, []); // Run only once on component mount
  return (
    <>
      {!SignupCompleted && (
        <Suspense fallback={<div>Loading...</div>}>
          <CompleteSignUp setSignupCompleted={setSignupCompleted} />
        </Suspense>
      )}
    </>
  );
};

export default Dashboard;
