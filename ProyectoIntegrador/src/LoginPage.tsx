// Import necessary libraries
import { useState } from "react";
import { Button, Container, TextField, Typography } from "@mui/material";
// import { auth } from "./firebase"; // Make sure to set up your Firebase configuration

const LoginPage = () => {
  // State to store user input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Function to handle login
  const handleLogin = async () => {
    //     try {
    //       await auth.signInWithEmailAndPassword(email, password);
    //       // Handle successful login (redirect, etc.)
    //     } catch (error) {
    //       // Handle login error (display error message, etc.)
    //       console.error("Login error:", error.message);
    //     }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" align="center" style={{ margin: "20px 0" }}>
        Login
      </Typography>
      <form>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={{ margin: "20px 0" }}
          onClick={handleLogin}
        >
          Login
        </Button>
      </form>
    </Container>
  );
};

export default LoginPage;
