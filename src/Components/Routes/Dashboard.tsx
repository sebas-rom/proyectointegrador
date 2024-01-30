// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Channel from "../MainChat/Channel.tsx";
import MainChat from "../MainChat/MainChat.tsx";
import { Navbar } from "../Navbar/Navbar.tsx";
import { signUpCompleted } from "../../Contexts/Session/Firebase.tsx";
import { Suspense, lazy, useEffect, useState } from "react";

const CompleteSignUp = lazy(() => import("../AccountEdit/CompleteSignUp.tsx"));
const Dashboard = () => {
  const [SignupCompleted, setSignupCompleted] = useState(true);

  const checkSignUpCompleted = async () => {
    const isCompleted = await signUpCompleted();
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

      <Navbar />
      <MainChat />
    </>
  );
};

export default Dashboard;
