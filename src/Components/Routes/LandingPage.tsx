import { Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "../LandingNavbar/LandingNavbar";
//
//
// no-Docs-yet
//
//
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <LandingNavbar />
      <Container></Container>
    </>
  );
}
