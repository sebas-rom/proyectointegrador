import { Stack } from "@mui/material";
import EditData from "../AccountEdit/EditData.tsx";
import EditPhoto from "../AccountEdit/EditPhoto.tsx";

/**
 * The `MyAccount` component serves as a container for user account management features.
 * It aggregates the functionalities provided by `EditPhoto` for photo management and
 * `EditData` for handling of personal data, allowing the user to view and update
 * their profile information.
 */
function MyAccount() {
  return (
    <Stack spacing={3} alignContent={"center"} alignItems={"center"}>
      <div />
      <EditPhoto />
      <EditData />
      <div />
    </Stack>
  );
}

export default MyAccount;
