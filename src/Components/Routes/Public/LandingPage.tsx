import { Container } from "@mui/material";
import LandingNavbar from "../../Navbar/LandingNavbar/LandingNavbar.tsx";
import workdesk from "../../../assets/images/workdesk5.webp";

/**
 * Landing page component for the application.
 * @returns {JSX.Element} - The LandingPage component UI.
 * @component
 */
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
