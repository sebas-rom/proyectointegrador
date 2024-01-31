import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
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
  getDocs,
} from "firebase/firestore";
import { Box, Divider, IconButton, InputBase, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Message from "./Message.tsx";

export const Chat = ({ room }) => {
  const messageBatch = 10;
  const [messages, setMessages] = useState([]);
  const [olderMessages, setOlderMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesRef = collection(db, "messages");
  const lastVisibleMessageRef = useRef(null);

  // Function to load older messages
  const loadOlderMessages = async () => {
    const lastVisibleMessage = lastVisibleMessageRef.current;
    const lastVisibleTimestamp = lastVisibleMessage?.createdAt;

    if (lastVisibleTimestamp) {
      const queryOldMessages = query(
        messagesRef,
        where("room", "==", room),
        where("createdAt", "<", lastVisibleTimestamp),
        orderBy("createdAt", "desc"),
        limit(messageBatch)
      );

      try {
        const snapshot = await getDocs(queryOldMessages);
        const olderMessages = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        setOlderMessages((prevOlderMessages) => [
          ...olderMessages.reverse(),
          ...prevOlderMessages,
        ]);
        lastVisibleMessageRef.current = olderMessages[0];
      } catch (error) {
        console.error("Error loading older messages:", error);
      }
    }
  };

  useEffect(() => {
    // Event listener for scrolling
    const handleScroll = () => {
      if (messagesContainerRef.current.scrollTop === 0) {
        loadOlderMessages();
      }
    };

    messagesContainerRef.current.addEventListener("scroll", handleScroll);

    return () => {
      messagesContainerRef.current.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Fetch new messages
    const queryMessages = query(
      messagesRef,
      where("room", "==", room),
      orderBy("createdAt", "desc"),
      limit(messageBatch)
    );

    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let newMessages = [];
      snapshot.forEach((doc) => {
        newMessages.push({ ...doc.data(), id: doc.id });
      });

      setMessages(newMessages.reverse());
      lastVisibleMessageRef.current = newMessages[0];
    });

    return () => unsubscribe();
  }, [room]);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newMessage === "") return;
    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      userName: auth.currentUser.displayName,
      uid: auth.currentUser.uid,
      photoURL: auth.currentUser.photoURL,
      room,
    });

    setNewMessage("");
    scrollToBottom();
  };

  const messagesContainerRef = useRef(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        ref={messagesContainerRef}
        sx={{
          flexGrow: 1,
          overflow: "auto",
          alignSelf: "flex-end",
          width: "100%",
        }}
      >
        {olderMessages.map((message) => (
          <Message key={message.id} {...message} />
        ))}
        {messages.map((message) => (
          <Message key={message.id} {...message} />
        ))}
      </Box>

      <Paper
        component="form"
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          position: "relative",
        }}
        onSubmit={handleSubmit}
        elevation={3}
      >
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          placeholder="Type your message here..."
        />
        <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
        <IconButton
          color="primary"
          sx={{ p: "10px" }}
          aria-label="directions"
          onClick={handleSubmit}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};
