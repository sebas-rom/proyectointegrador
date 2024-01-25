import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { db, auth } from "../../Contexts/Session/Firebase.tsx";
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
import { Button, Container, TextField } from "@mui/material";
import Message from "./Message";

const Channel = () => {
  const user = auth.currentUser;
  const messagesRef = collection(db, "messages");

  const [messagesList, setMessagesList] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const inputRef = useRef<HTMLInputElement>(null); // explicitly set the type to HTMLInputElement

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleOnChange = (e) => {
    setNewMessage(e.target.value);
  };

  useEffect(() => {
    const messagesQuery = query(messagesRef, orderBy("createdAt"), limit(100));

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setMessagesList(data);
    });

    return () => unsubscribe();
  }, [messagesRef]);

  const handleOnSubmit = (e) => {
    e.preventDefault();
    const trimmedMessage = newMessage.trim();
    if (db) {
      setDoc(doc(messagesRef), {
        text: trimmedMessage,
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    }
  };

  return (
    <>
      <Container sx={{ height: 300, overflow: "auto" }}>
        {messagesList.map((message) => (
          <Message key={message.id} {...message} />
        ))}
      </Container>

      {/* <Container sx={{ height: 300, overflow: "auto" }}>
        <Message list={messagesList} />
      </Container> */}

      <div>
        <form onSubmit={handleOnSubmit}>
          <TextField
            inputRef={inputRef}
            type="text"
            value={newMessage}
            onChange={handleOnChange}
            placeholder="Type your message here..."
          />
          <Button type="submit" disabled={!newMessage}>
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
