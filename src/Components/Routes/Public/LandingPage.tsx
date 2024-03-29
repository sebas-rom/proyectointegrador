import { Container } from "@mui/material";
import LandingNavbar from "../../LandingNavbar/LandingNavbar";
import workdesk from "../../../assets/images/workdesk5.webp";
//
//
// no-Docs-yet
//
//
export default function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <div style={{ height: 600, overflow: "hidden", position: "relative" }}>
        <img
          src={workdesk}
          style={{ width: "100%", top: -150, position: "absolute" }}
        />
      </div>

      <Container></Container>
    </>
  );
}
