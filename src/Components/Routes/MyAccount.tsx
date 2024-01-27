import EditData from "../AccountEdit/EditData.tsx";
import { Navbar } from "../Navbar/Navbar.tsx";

import EditPhoto from "../AccountEdit/EditPhoto.tsx";

function MyAccount() {
  return (
    <>
      <Navbar />

      <EditPhoto />
      <EditData />
    </>
  );
}

export default MyAccount;
