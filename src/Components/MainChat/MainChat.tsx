import React from "react";
import Channel from "./Channel";
import { auth } from "../../Contexts/Session/Firebase";
function MainChat() {
  const user = auth.currentUser;
  if (user) return <Channel user={user} />;
  //   return <Channel user={auth.currentUser} />;
}

export default MainChat;
