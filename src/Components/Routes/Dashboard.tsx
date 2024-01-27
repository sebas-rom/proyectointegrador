// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import Channel from "../MainChat/Channel.tsx";
import MainChat from "../MainChat/MainChat.tsx";

import { Navbar } from "../Navbar/Navbar.tsx";
import { auth } from "../../Contexts/Session/Firebase.tsx";
import MyAccount from "./MyAccount.tsx";

const Dashboard = () => {
  return (
    <>
      <Navbar />
      {/* <Channel user={auth.currentUser} /> */}
      <MainChat />
      {/* <MyAccount /> */}
    </>
  );
};

export default Dashboard;
