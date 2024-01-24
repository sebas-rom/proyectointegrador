import { Button, Typography, Stack } from "@mui/material";
import { auth, logout } from "../../Contexts/Session/Firebase.tsx";
import "./navbar.css";
import noAvatar from "../../assets/noAvatar.webp";
import { useNavigate } from "react-router-dom";

function ShowAccount() {
  const photoURL = auth.currentUser?.photoURL;
  const navigate = useNavigate();
  const handleMyAccount = () => {
    navigate("/account");
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
