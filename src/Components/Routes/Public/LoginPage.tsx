import { FormEvent, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  emailLogin,
  googleLogin,
} from "../../../Contexts/Session/Firebase.tsx";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import {
  Button,
  Typography,
  Container,
  TextField,
  Box,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Stack,
} from "@mui/material";
import { useError } from "../../../Contexts/Error/ErrorContext.tsx";
import GoogleIcon from "@mui/icons-material/Google";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
/**
 * `LoginPage` component is responsible for handling the login process.
 * It allows users to log in with either Google authentication or email and password.
 * Authentication functions are provided by Firebase authentication services,
 * and any errors are handled through a custom error context.
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailAndPassword, setShowEmailAndPassword] = useState(false);
  const [googleSignInCompleted, setGoogleSignInCompleted] = useState(false);

  /**
   * Attempts to sign in the user using Google authentication.
   * On success, navigates to the dashboard.
   * On failure, shows an error message.
   */
  const handleGoogleSignIn = async () => {
    try {
      const user = await googleLogin();
      if (user) {
        // Additional logic can be added here if needed
        setGoogleSignInCompleted(true);
        navigate("/dashboard");
      }
    } catch (error) {
      showError("LogIn Error", error.code);
    }
  };

  /**
   * Handles the form submission for email login. Prevents the default form submission event.
   * Attempts to log in the user and on success, navigates to the dashboard.
   * On error, it provides feedback to the user based on the error code.
   *
   * @param e - The event object for form submission.
   */
  const onSubmitEmail = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const user = await emailLogin(email, password);
      if (user) {
        navigate("/dashboard");
      }
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          showError("LogIn Error", "Email address already in use.");
          break;
        case "auth/invalid-email":
          showError("LogIn Error", "Email addres is invalid.");
          break;
        case "auth/operation-not-allowed":
          showError("LogIn Error", "Error during sign up.");
          break;
        case "auth/weak-password":
          showError(
            "LogIn Error",
            "Password is not strong enough. Add additional characters including special characters and numbers."
          );
          break;
        default:
          console.log(error.message);
          break;
      }
    }
  };

  /**
   * Reveals the email and password login form fields when invoked.
   */
  const showEmailAndPasswordFields = () => {
    setShowEmailAndPassword(true);
  };

  const [showPassword, setShowPassword] = useState(false);

  /**
   * Toggles the visibility of the password.
   */
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  /**
   * Handles the mouse down event on the password visibility toggle button.
   * Prevents the default behavior to ensure a consistent experience.
   *
   * @param event - The mouse event.
   */
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <>
      <Container component="main">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            FreeEcu
          </Typography>
          <Stack spacing={2}>
            <div />
            <Button
              variant="contained"
              onClick={handleGoogleSignIn}
              disabled={googleSignInCompleted}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <GoogleIcon sx={{ marginRight: 1 }} />
              Log In with Google
            </Button>
            <Button
              variant="outlined"
              onClick={showEmailAndPasswordFields}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              <MailOutlineIcon sx={{ marginRight: 1 }} />
              Log In with Email
            </Button>
          </Stack>
          {showEmailAndPassword && (
            <Box component="form" onSubmit={onSubmitEmail} sx={{ mt: 1 }}>
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
              <FormControl variant="outlined" fullWidth>
                <InputLabel htmlFor="outlined-adornment-password">
                  Password
                </InputLabel>
                <OutlinedInput
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  autoComplete="current-password"
                  id="outlined-adornment-password"
                  name="password"
                  required
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
              </FormControl>
              <Typography variant="body2" color="textSecondary">
                <NavLink to="/signup">Forgot password?</NavLink>
              </Typography>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Log In
              </Button>
            </Box>
          )}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Don't have an account? <NavLink to="/signup">Join Now</NavLink>
            </Typography>
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default LoginPage;
