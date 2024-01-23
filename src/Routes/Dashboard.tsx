import { signOut } from "firebase/auth";
import { Button } from "@mui/material";
import { auth } from "../Session/Firebase.tsx";
// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Navbar } from "../Components/Navbar/Navbar.tsx";

const handleSignOut = async () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
      console.log(error);
    });
};

const Dashboard = () => {
  return (
    <>
      <Navbar />
      <Button variant="contained" sx={{ mt: 1, mb: 2 }} onClick={handleSignOut}>
        Sign Out
      </Button>
    </>
  );
};

export default Dashboard;
