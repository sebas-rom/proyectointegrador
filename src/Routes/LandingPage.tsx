import { Button } from "@mui/material";
import React from "react";

export default function LandingPage() {
  return (
    <>
      <Button variant="contained" href="/login">
        Login
      </Button>
      <Button variant="contained" href="/signup">
        SignUp
      </Button>
    </>
  );
}
