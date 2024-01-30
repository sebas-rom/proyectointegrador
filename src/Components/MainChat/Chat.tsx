import React, { useState, useEffect } from "react";
import { db, auth } from "../../Contexts/Session/Firebase.tsx";
import {
  collection,
  addDoc,
  where,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import noAvatar from "../../assets/noAvatar.webp";
import { Button, Container, TextField } from "@mui/material";

export const Chat = ({ room }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesRef = collection(db, "messages");

  useEffect(() => {
    const queryMessages = query(
      messagesRef,
      where("room", "==", room),
      orderBy("createdAt"),
      limit(100)
    );
    const unsuscribe = onSnapshot(queryMessages, (snapshot) => {
      let messages = [];
      snapshot.forEach((doc) => {
        messages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(messages);
    });

    return () => unsuscribe();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newMessage === "") return;
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      user: auth.currentUser.displayName,
      uid: auth.currentUser.uid,
      photoURL: auth.currentUser.photoURL,
      room,
    });

    setNewMessage("");
  };

  return (
    <>
      <div>
        <h1>Chat room {room.toUpperCase()}</h1>
      </div>
      <Container>
        {messages.map((message) => (
          <div key={message.id} className="message">
            {message.uid !== auth.currentUser.uid && (
              <img
                src={message.photoURL || noAvatar}
                alt="Avatar"
                style={{ width: "50px", height: "50px", borderRadius: "50%" }}
              />
            )}
            <span className="user">{message.user}:</span> {message.text}
            {message.uid == auth.currentUser.uid && (
              <img
                src={message.photoURL || noAvatar}
                alt="Avatar"
                style={{ width: "50px", height: "50px", borderRadius: "50%" }}
              />
            )}
          </div>
        ))}
      </Container>

      <form onSubmit={handleSubmit}>
        <TextField
          type="text"
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          placeholder="Type your message here..."
        />
        <Button type="submit" className="send-button">
          Send
        </Button>
      </form>
    </>
  );
};
