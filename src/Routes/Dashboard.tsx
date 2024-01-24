// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Navbar } from "../Components/Navbar/Navbar.tsx";
import MyAccount from "./MyAccount.tsx";

const Dashboard = () => {
  return (
    <>
      <Navbar />
      <MyAccount />
    </>
  );
};

export default Dashboard;
