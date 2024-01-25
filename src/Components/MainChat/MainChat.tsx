import React from "react";
import Channel from "../MainChat/Channel";
import { Chat } from "./Chat.tsx";
import { FindPeople } from "../FindPeople.tsx";
function MainChat() {
  return (
    <>
      <Chat room={"1"} />
      <FindPeople />
    </>
  );
  //   return <Channel user={auth.currentUsser} />;
}

export default MainChat;
