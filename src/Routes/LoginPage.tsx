import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../Session/Firebase.tsx";
import { Button, Typography, Container, TextField, Box } from "@mui/material";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
} from "firebase/auth";

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailAndPassword, setShowEmailAndPassword] = useState(false);
  const [googleSignInCompleted, setGoogleSignInCompleted] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      const user = result.user;

      setGoogleSignInCompleted(true);
      navigate("/dashboard");
    } catch (error) {
      // Handle Google sign-in errors
      // @ts-ignore
      console.error(error.code, error.message);
    }
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      // console.log(user);
      navigate("/dashboard");
    } catch (error) {
      // @ts-ignore
      const errorCode = error.code;
      // @ts-ignore
      const errorMessage = error.message;
      console.log(errorCode, errorMessage);
    }
  };

  const showEmailAndPasswordFields = () => {
    setShowEmailAndPassword(true);
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          FocusApp
        </Typography>
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleGoogleSignIn}
          disabled={googleSignInCompleted}
        >
          Continue with Google
        </Button>
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 1, mb: 2 }}
          onClick={showEmailAndPasswordFields}
        >
          Continue with Email
        </Button>
        {showEmailAndPassword && (
          <Box component="form" onSubmit={onSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign up
            </Button>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Don't have an account?{" "}
            <NavLink to="/proyectointegrador/signup">Sign Up</NavLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
