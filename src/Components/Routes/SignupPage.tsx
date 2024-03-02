import { FormEvent, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { emailSignUp, googleLogin } from "../../Contexts/Session/Firebase.tsx";
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
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useError } from "../../Contexts/Error/ErrorContext.tsx";

/**
 * The Signup component provides a user interface for account creation.
 * Users can sign up using either their email and password or through Google authentication.
 * It uses Firebase authentication services for account creation and error context to
 * display error messages.
 */
const Signup = () => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailAndPassword, setShowEmailAndPassword] = useState(false);
  const [googleSignUpCompleted, setGoogleSignUpCompleted] = useState(false);

  /**
   * Handles the Google sign up process. On successful account creation, the user is
   * redirected to the dashboard. Errors are displayed using the error context.
   */
  const handleGoogleSignUp = async () => {
    try {
      const user = await googleLogin();
      if (user) {
        // Additional logic can be added here if needed
        setGoogleSignUpCompleted(true);
        navigate("/dashboard");
      }
    } catch (error) {
      showError("Sign Up Error", error.code);
    }
  };

  /**
   * Handles the email and password sign up submission. On successful account creation, the user is
   * navigated to the dashboard. Errors are handled and displayed appropriately.
   *
   * @param {React.FormEvent<HTMLFormElement>} e The event object associated with form submission.
   */
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const user = await emailSignUp(email, password);
      if (user) {
        navigate("/dashboard");
      }
    } catch (error) {
      showError("Sign Up Error", error.code);
    }
  };

  /**
   * Reveals the email and password input fields so the user can enter their credentials.
   */
  const showEmailAndPasswordFields = () => {
    setShowEmailAndPassword(true);
  };

  const [showPassword, setShowPassword] = useState(false);

  /**
   * Toggles the visibility of the password in the input field.
   */
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  /**
   * Prevents the default mousedown event from occurring when the user interacts with the
   * password visibility toggle button.
   *
   * @param {React.MouseEvent<HTMLButtonElement>} event The mouse event triggered by button interaction.
   */
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
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
          onClick={handleGoogleSignUp}
          disabled={googleSignUpCompleted}
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Create Account
            </Button>
          </Box>
        )}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Already have an account? <NavLink to="/login">Sign in</NavLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Signup;
