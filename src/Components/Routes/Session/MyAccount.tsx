import { Stack, Typography } from "@mui/material";
import EditData from "../../AccountEdit/EditData.tsx";
import EditPhoto from "../../AccountEdit/EditPhoto.tsx";
import { Link } from "react-router-dom";
import { auth } from "../../../Contexts/Session/Firebase.tsx";

/**
 * The `MyAccount` component serves as a container for user account management features.
 * It aggregates the functionalities provided by `EditPhoto` for photo management and
 * `EditData` for handling of personal data, allowing the user to view and update
 * their profile information.
 */
function MyAccount() {
  return (
    <Stack
      spacing={3}
      alignContent={"center"}
      alignItems={"center"}
      justifyContent={"center"}
      sx={{
        minHeight: {
          xs: "calc(100vh - 54px)",
          sm: "calc(100vh - 64px)",
        },
      }}
    >
      <EditPhoto />
      <EditData />

      <Typography variant="h5" color={"inherit"}>
        <Link
          to={`/view-profile/${auth.currentUser.uid}`}
          style={{
            textDecoration: "none",
            color: "inherit",
          }}
        >
          View my Public Profile
        </Link>
      </Typography>
    </Stack>
  );
}

export default MyAccount;
