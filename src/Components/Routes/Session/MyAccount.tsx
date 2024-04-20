import { Button, Stack, Typography } from "@mui/material";
import EditData from "../../AccountEdit/EditData.tsx";
import EditPhoto from "../../AccountEdit/EditPhoto.tsx";
import { Link } from "react-router-dom";
import { auth } from "../../../Contexts/Session/Firebase.tsx";
import CustomContainer from "../../DataDisplay/CustomContainer.tsx";
import { VIEW_PROFILE_PATH } from "../routes.tsx";

/**
 * The `MyAccount` component serves as a container for user account management features.
 * It aggregates the functionalities provided by `EditPhoto` for photo management and
 * `EditData` for handling of personal data, allowing the user to view and update
 * their profile information.
 */
function MyAccount() {
  return (
    <CustomContainer>
      <Stack alignItems={"flex-end"}>
        <Button variant="outlined">
          <Link
            to={`/${VIEW_PROFILE_PATH}/${auth.currentUser.uid}`}
            style={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            View my Public Profile
          </Link>
        </Button>
      </Stack>
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
      </Stack>
    </CustomContainer>
  );
}

export default MyAccount;
