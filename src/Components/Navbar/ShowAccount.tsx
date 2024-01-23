import { Button, Typography, Stack } from "@mui/material";
import { signOut } from "firebase/auth";
import { auth } from "../../Session/Firebase.tsx";
import "./navbar.css";
import noAvatar from "../../assets/noAvatar.webp";

function ShowAccount() {
  const photoURL = auth.currentUser?.photoURL;

  const handleSignOut = async () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        // An error happened.
        console.log(error);
      });
  };

  return (
    <>
      <Stack alignItems={"center"} spacing={2}>
        <img src={photoURL || noAvatar} alt="Avatar" className="avatarImg" />

        <Typography variant="h5" textAlign={"center"}>
          {auth.currentUser?.displayName}
        </Typography>
      </Stack>

      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Button variant="text">My Account</Button>
        <Button variant="text" onClick={handleSignOut}>
          Sign Out
        </Button>
      </Stack>
    </>
  );
}

export default ShowAccount;
