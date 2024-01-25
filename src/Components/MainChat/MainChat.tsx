import React from "react";
import Channel from "../MainChat/Channel";
import { Chat } from "./Chat.tsx";
function MainChat() {
  return <Chat room={"1"} />;
  //   return <Channel user={auth.currentUsser} />;
}

export default MainChat;
