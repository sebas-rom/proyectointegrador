import EditData from "./EditData.tsx";
import { Navbar } from "../Components/Navbar/Navbar.tsx";

import EditPhoto from "../Components/AccountEdit/EditPhoto.tsx";

function MyAccount() {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      <EditPhoto />
      <EditData />
    </>
  );
}

export default MyAccount;
