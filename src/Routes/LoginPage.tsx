import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { emailLogin, googleLogin } from "../Contexts/Session/Firebase.tsx";
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
} from "@mui/material";
import { useError } from "../Contexts/Error/ErrorContext.tsx";

const LoginPage = () => {
  const navigate = useNavigate();
  const { showError } = useError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showEmailAndPassword, setShowEmailAndPassword] = useState(false);
  const [googleSignInCompleted, setGoogleSignInCompleted] = useState(false);

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

  const onSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const user = await emailLogin(email, password);
      if (user) {
        navigate("/dashboard");
      }
    } catch (error) {
      showError("LogIn Error", error.code);
    }
  };

  const showEmailAndPasswordFields = () => {
    setShowEmailAndPassword(true);
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

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
            Don't have an account? <NavLink to="/signup">Sign Up</NavLink>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;
