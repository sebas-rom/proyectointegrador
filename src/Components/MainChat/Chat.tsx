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
import noAvatar from "../../assets/noAvatar.webp";
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputBase,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Message from "./Message.tsx";

export const Chat = ({ room }) => {
  const messageBatch = 15;
  const [messages, setMessages] = useState([]);
  const [olderMessages, setolderMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesRef = collection(db, "messages");
  const lastVisibleMessageRef = useRef(null); // Ref to store the last visible message

  const loadOlderMessages = async () => {
    console.log("Loading older messages...");
    const lastVisibleMessage = lastVisibleMessageRef.current;
    console.log("Last visible message:", lastVisibleMessage);
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
        //add here the current older messages olderMessages to the newly fetched olderMessages
        setolderMessages((prevOlderMessages) => [
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
    const handleScroll = () => {
      if (messagesContainerRef.current.scrollTop === 0) {
        // User has scrolled to the top
        loadOlderMessages();
      }
    };

    messagesContainerRef.current.addEventListener("scroll", handleScroll);

    return () => {
      messagesContainerRef.current.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
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
      // Update lastVisibleMessageRef after setting new messages
      lastVisibleMessageRef.current = newMessages[0];
    });

    return () => unsubscribe();
  }, [room]); // Include room as a dependency to re-run the effect when room changes

  useLayoutEffect(() => {
    scrollToBottom(); // Scroll to the bottom after initial render
  }, [messages]); // Include messages as a dependency to re-run the effect when messages change

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

  const messagesContainerRef = useRef(null); // Create a ref for the messages container

  const scrollToBottom = () => {
    // Scroll to the bottom of the messages container
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
          alignSelf: "flex-end", // Align to the end of the flex container
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
