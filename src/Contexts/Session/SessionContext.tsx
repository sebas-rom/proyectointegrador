import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Firebase.tsx";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useTheme } from "@mui/system";

const SessionContext = createContext({});

export const useSession = () => {
  return useContext(SessionContext);
};

export const SessionProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useAuth(); // Use useAuth hook

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSessionClosedPopup, setShowSessionClosedPopup] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      // Check if authLoading is false to avoid showing the popup during initial loading
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
        setShowSessionClosedPopup(true);
      }
      setLoading(false);
    }
  }, [authUser, authLoading]);

  const closeSessionPopup = () => {
    setShowSessionClosedPopup(false);
    navigate("/login");
  };

  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;

  return (
    <SessionContext.Provider value={{ user, loading, closeSessionPopup }}>
      {user && children} {/* Render children only if user exists */}
      {showSessionClosedPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            // backdropFilter: "blur(20px)", // Apply blur to the backdrop
            zIndex: 1000, // Ensure the popup is on top
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: primaryColor,
            opacity: 1,
            backgroundImage:
              "linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(30deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(150deg, #ffffff 12%, transparent 12.5%, transparent 87%, #ffffff 87.5%, #ffffff), linear-gradient(60deg, #ffffff77 25%, transparent 25.5%, transparent 75%, #ffffff77 75%, #ffffff77), linear-gradient(60deg, #ffffff77 25%, transparent 25.5%, transparent 75%, #ffffff77 75%, #ffffff77)",
            backgroundSize: "80px 140px",
            backgroundPosition:
              "0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px",
          }}
        >
          <Dialog
            open={showSessionClosedPopup}
            onClose={closeSessionPopup}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"No Session Detected"}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Your session has been closed. Please log in.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => navigate("/login")} autoFocus>
                Log In
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </SessionContext.Provider>
  );
};