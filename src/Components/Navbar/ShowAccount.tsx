import { useState } from "react";
import { Button, Typography, Stack, Skeleton, Tooltip } from "@mui/material";
import { auth, logout, getUserData } from "../../Contexts/Session/Firebase.tsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ColoredAvatar from "../DataDisplay/ColoredAvatar.tsx";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
/**
 * The ShowAccount component displays the current authenticated user's information,
 * which includes a colored avatar and the user's name. It also provides options to navigate
 * to the account management page or to sign out.
 *
 * The user information is fetched during the initial render (or refresh of the component)
 * from Firebase based on the current authenticated user's UID. Utilizes a loading state
 * to display placeholders during data retrieval.
 */
function ShowAccount() {
  const [photoURL, setPhotoURL] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserData(auth.currentUser.uid);
        setPhotoURL(userData.photoURL);
        setUserName(userData.firstName + " " + userData.lastName);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const navigate = useNavigate();
  const handleMyAccount = () => {
    navigate("/account");
  };

  return (
    <>
      <Stack alignItems={"center"} spacing={2}>
        {!loading ? (
          <>
            <div style={{ position: "relative", display: "inline-block" }}>
              <ColoredAvatar
                userName={userName}
                photoURL={photoURL}
                size="large"
              />
              <Tooltip title="Close session" placement="top" arrow>
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    borderRadius: "50%",
                    maxHeight: "40px",
                    maxWidth: "40px",
                    minHeight: "40px",
                    minWidth: "40px",
                    position: "absolute",
                    top: 0,
                    right: 0,
                  }}
                  onClick={logout}
                >
                  <PowerSettingsNewIcon />
                </Button>
              </Tooltip>
            </div>
            <Typography variant="h5" textAlign={"center"}>
              {userName}
            </Typography>
          </>
        ) : (
          <>
            <Skeleton variant="circular" width={"100px"} height={"100px"} />
            <Skeleton variant="text" width={"100%"} height={"35px"} />
          </>
        )}
      </Stack>

      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Button variant="text" onClick={handleMyAccount}>
          My Account
        </Button>
      </Stack>
    </>
  );
}

export default ShowAccount;
