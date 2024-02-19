import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
//
//
// no-Docs-yet
//
//
export default function LandingPage() {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login");
  };
  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <>
      <Button variant="contained" onClick={handleLogin}>
        Login
      </Button>
      <Button variant="contained" onClick={handleSignup}>
        SignUp
      </Button>
    </>
  );
}
