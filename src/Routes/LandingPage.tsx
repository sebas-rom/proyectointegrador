import { Button } from "@mui/material";

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
