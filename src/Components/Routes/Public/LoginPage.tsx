import { FormEvent, useState } from "react";
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
  Paper,
  Link,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import freelanceWorker from "../../../assets/svg/freelanceWorker.svg";
import { useFeedback } from "../../../Contexts/Feedback/FeedbackContext.tsx";
/**
 * `LoginPage` component is responsible for handling the login process.
 * It allows users to log in with either Google authentication or email and password.
 * Authentication functions are provided by Firebase authentication services,
 * and any errors are handled through a custom error context.
 */
const LoginPage = () => {
  const { showDialog } = useFeedback();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailAndPassword, setShowEmailAndPassword] = useState(false);
  const [googleSignInCompleted, setGoogleSignInCompleted] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);

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
        // navigate("/dashboard");
      }
    } catch (error) {
      showDialog("LogIn Error", error.code, "Close", "error");
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
        // navigate("/dashboard");
      }
    } catch (error) {
      switch (error.code) {
        case "auth/email-already-in-use":
          showDialog(
            "LogIn Error",
            "Email address already in use.",
            "Close",
            "error"
          );
          break;
        case "auth/invalid-email":
          showDialog(
            "LogIn Error",
            "Email addres is invalid.",
            "Close",
            "error"
          );
          break;
        case "auth/operation-not-allowed":
          showDialog("LogIn Error", "Error during sign up.", "Close", "error");
          break;
        case "auth/weak-password":
          showDialog(
            "LogIn Error",
            "Password is not strong enough. Add additional characters including special characters and numbers.",
            "Close",
            "error"
          );

          break;
        case "auth/invalid-credential":
          setInvalidCredentials(true);
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
    <Container
      sx={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        minWidth: "100%",
      }}
    >
      <img
        src={freelanceWorker}
        style={{
          position: "absolute",
          top: 0,
          right: "-10%",
          height: "100%",
          overflow: "hidden",
          zIndex: -1, // Ensure the image is behind the Stack
        }}
      />
      <Stack
        alignContent={"center"}
        alignItems={"center"}
        justifyContent={"center"}
        sx={{ height: "100vh" }}
      >
        <Paper sx={{ padding: 3, minWidth: "400px" }}>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={{ width: "100%" }}
          >
            <Typography component="h1" variant="h5">
              Login
            </Typography>

            <Link href="/signup" underline="hover">
              Don't have an account?
            </Link>
          </Stack>

          <Stack spacing={2} alignItems={"center"}>
            <div />
            <Button
              variant="contained"
              onClick={handleGoogleSignIn}
              disabled={googleSignInCompleted}
              fullWidth
            >
              <GoogleIcon sx={{ marginRight: 1 }} />
              Log In with Google
            </Button>
            <Button
              variant="outlined"
              onClick={showEmailAndPasswordFields}
              fullWidth
            >
              <MailOutlineIcon sx={{ marginRight: 1 }} />
              Log In with Email
            </Button>
            <div />
          </Stack>
          {showEmailAndPassword && (
            <Box component="form" onSubmit={onSubmitEmail} sx={{ mt: 1 }}>
              <Stack spacing={2}>
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
                {invalidCredentials && (
                  <Typography color="error" variant="body1">
                    Invalid email or password. Please try again.
                  </Typography>
                )}
                <div />
              </Stack>

              <Stack spacing={2} alignItems={"flex-end"}>
                <Link href="/signup" underline="hover">
                  Forgot password?
                </Link>
                <div />
              </Stack>
              <Button type="submit" fullWidth variant="contained">
                Log In
              </Button>
            </Box>
          )}
        </Paper>
      </Stack>
    </Container>
  );
};

export default LoginPage;
