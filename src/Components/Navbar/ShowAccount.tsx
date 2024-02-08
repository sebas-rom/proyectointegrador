import { useState } from "react";
import { Button, Typography, Stack, Skeleton } from "@mui/material";
import {
  auth,
  logout,
  getUserInfoFromUid,
} from "../../Contexts/Session/Firebase.tsx";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ColoredAvatar from "../DataDisplay/ColoredAvatar.tsx";

function ShowAccount() {
  const [photoURL, setPhotoURL] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const [tempUserName, tempPhotoURL] = await getUserInfoFromUid(
          auth.currentUser.uid
        );
        setPhotoURL(tempPhotoURL);
        setUserName(tempUserName);
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
        {userName && photoURL ? (
          <>
            <ColoredAvatar
              userName={userName}
              photoURL={photoURL}
              size="large"
            />
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
        <Button variant="text" onClick={logout}>
          Sign Out
        </Button>
      </Stack>
    </>
  );
}

export default ShowAccount;
