import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { USERS_COLLECTION, UserData, auth, db, useAuth } from "./Firebase.tsx";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useTheme } from "@mui/system";
import { doc, onSnapshot } from "firebase/firestore";
import {
  COMPLETE_SIGNUP_PATH,
  DASHBOARD_PATH,
  LOGIN_PATH,
  PRIVACY_POLICY_PATH,
  SIGNUP_PATH,
  TERMS_AND_CONDITIONS_PATH,
} from "../../Components/Routes/routes";

/**
 * Creates a new React context for session status.
 */
const SessionContext = createContext({});

/**
 * A custom hook for consuming the session context.
 * @returns The context containing user information and loading state.
 */
export const useSession = () => {
  return useContext(SessionContext);
};

/**
 * Provides session context to its children and handles displaying a popup
 * when the user's session has ended.
 * @param children The React elements wrapped in the session context.
 * @returns A JSX.Element that provides session context to its children.
 */
export const SessionProvider = ({ children }) => {
  const whitelist = [`/${TERMS_AND_CONDITIONS_PATH}`, `/${PRIVACY_POLICY_PATH}`];

  const goToDashboard = ["/", `/${LOGIN_PATH}`, `/${SIGNUP_PATH}`];

  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useAuth(); // Use useAuth hook

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSessionClosedPopup, setShowSessionClosedPopup] = useState(false);
  const [SignupCompleted, setSignupCompleted] = useState(false);
  useEffect(() => {
    let unsubscribeUser;
    const init = async () => {
      if (!authLoading) {
        // Check if authLoading is false to avoid showing the popup during initial loading
        if (authUser) {
          setUser(authUser);
          try {
            unsubscribeUser = await onSnapshot(doc(db, USERS_COLLECTION, auth.currentUser.uid), (doc) => {
              const userData = doc.data() as UserData;
              setSignupCompleted(userData?.signUpCompleted || false);
              if (!userData?.signUpCompleted || false) {
                navigate(`/${COMPLETE_SIGNUP_PATH}`);
              } else {
                if (
                  goToDashboard.includes(window.location.pathname) ||
                  window.location.pathname === `/${COMPLETE_SIGNUP_PATH}`
                ) {
                  navigate(`/${DASHBOARD_PATH}`);
                }
              }
            });
          } catch (e) {
            console.log(e);
          }

          // Redirect to /dashboard if the user is logged in and visits the root
          if (goToDashboard.includes(window.location.pathname) && authUser && SignupCompleted) {
            navigate(`/${DASHBOARD_PATH}`);
          }
        } else {
          setUser(null);
          if (!whitelist.includes(window.location.pathname) && !goToDashboard.includes(window.location.pathname)) {
            setShowSessionClosedPopup(true);
          }
        }
        setLoading(false);
      }
    };
    init();
    return () => {
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };
    //Avoid rerendering the component on missing dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, authLoading]);

  const closeSessionPopup = () => {
    setShowSessionClosedPopup(false);
    navigate(`/${LOGIN_PATH}`);
  };

  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const isInWhitelist =
    whitelist.includes(window.location.pathname) || goToDashboard.includes(window.location.pathname);
  return (
    <SessionContext.Provider
      value={{
        user,
        loading,
        closeSessionPopup,
      }}
    >
      {(user || isInWhitelist) && children}
      {/* Render children only if user exists */}
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
            backgroundPosition: "0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px",
          }}
        >
          <Dialog
            open={showSessionClosedPopup}
            onClose={closeSessionPopup}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"No Session Detected"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Your session has been closed. Please log in.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => navigate(`/${LOGIN_PATH}`)} autoFocus>
                Log In
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      )}
    </SessionContext.Provider>
  );
};
