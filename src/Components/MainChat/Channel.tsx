import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { db, auth } from "../../Contexts/Session/Firebase.tsx";
// Components
import Message from "./Message";
import {
  collection,
  doc,
  setDoc,
  orderBy,
  query,
  limit,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { Button } from "@mui/material";

const Channel = () => {
  const user = auth.currentUser;
  const messagesRef = collection(db, "messages");

  const messages = query(messagesRef, orderBy("createdAt"), limit(100));

  onSnapshot(messages, (querySnapshot: { docs: any[] }) => {
    const data = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setMessagesList(data);
  });

  const [messagesList, setMessagesList] = useState([]);

  const handleOnSubmit = (e) => {
    console.log("handleOnSubmit");
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (db) {
      setDoc(doc(messagesRef), {
        text: trimmedMessage,
        createdAt: serverTimestamp(),
        // uid: user.uid,
        displayName: user.displayName,
        // photoURL: user.photoURL,
      });
    }
  };

  const [newMessage, setNewMessage] = useState("");

  const inputRef = useRef();
  const bottomListRef = useRef();

  //   const { uid, displayName, photoURL } = user;

  useEffect(() => {
    if (inputRef.current) {
      //@ts-ignore
      inputRef.current.focus();
    }
  }, [inputRef]);

  const handleOnChange = (e) => {
    setNewMessage(e.target.value);
  };

  return (
    // <div className="flex flex-col h-full">
    //   <div className="overflow-auto h-full">
    //     <div className="py-4 max-w-screen-lg mx-auto">
    //       <div className="border-b dark:border-gray-600 border-gray-200 py-8 mb-4">
    //         <div className="font-bold text-3xl text-center">
    //           <p className="mb-1">Welcome to</p>
    //           <p className="mb-3">React FireChat</p>
    //         </div>
    //         <p className="text-gray-400 text-center">
    //           This is the beginning of this chat.
    //         </p>
    //       </div>
    //       <ul>
    //         {messages
    //           ?.sort((first, second) =>
    //             first?.createdAt?.seconds <= second?.createdAt?.seconds ? -1 : 1
    //           )
    //           ?.map((message) => (
    //             <li key={message.id}>
    //               <Message {...message} />
    //             </li>
    //           ))}
    //       </ul>
    //       <div ref={bottomListRef} />
    //     </div>
    //   </div>
    //   <div className="mb-6 mx-4">
    //     <form
    //       onSubmit={handleOnSubmit}
    //       className="flex flex-row bg-gray-200 dark:bg-coolDark-400 rounded-md px-4 py-3 z-10 max-w-screen-lg mx-auto dark:text-white shadow-md"
    //     >
    //       <input
    //         ref={inputRef}
    //         type="text"
    //         value={newMessage}
    //         onChange={handleOnChange}
    //         placeholder="Type your message here..."
    //         className="flex-1 bg-transparent outline-none"
    //       />
    //       <button
    //         type="submit"
    //         disabled={!newMessage}
    //         className="uppercase font-semibold text-sm tracking-wider text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
    //       >
    //         Send
    //       </button>
    //     </form>
    //   </div>
    // </div>
    <>
      <ul>
        {messagesList.map((message) => (
          <li key={message.id}>
            {message.displayName} : {message.text}
          </li>
        ))}
      </ul>
      <div className="mb-6 mx-4">
        <form
          onSubmit={handleOnSubmit}
          className="flex flex-row bg-gray-200 dark:bg-coolDark-400 rounded-md px-4 py-3 z-10 max-w-screen-lg mx-auto dark:text-white shadow-md"
        >
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={handleOnChange}
            placeholder="Type your message here..."
            className="flex-1 bg-transparent outline-none"
          />
          <Button
            type="submit"
            disabled={!newMessage}
            className="uppercase font-semibold text-sm tracking-wider text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Send
          </Button>
        </form>
      </div>
    </>
  );
};

Channel.propTypes = {
  user: PropTypes.shape({
    uid: PropTypes.string,
    displayName: PropTypes.string,
    photoURL: PropTypes.string,
  }),
};

export default Channel;
