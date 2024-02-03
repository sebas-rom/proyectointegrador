import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  db,
  auth,
  getUserNameFromUid,
} from "../../Contexts/Session/Firebase.tsx";
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
import {
  Box,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Message from "./Message.tsx";
import { format, set } from "date-fns";
import MessageSkeleton from "./MessageSkeleton.tsx";

const Chat = ({ room }) => {
  if (!room) return;

  console.log(getUserNameFromUid(auth.currentUser.uid));

  const messageBatch = 10;
  const [messages, setMessages] = useState([]);
  const [olderMessages, setOlderMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesRef = collection(db, "messages");
  const lastVisibleMessageRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [loading, setLoading] = useState(true); // Added loading state

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

        for (let i = 0; i < olderMessages.length; i++) {
          olderMessages[i].userName = await getUserName(olderMessages[i].uid);
        }

        setOlderMessages((prevOlderMessages) => [
          ...olderMessages.reverse(),
          ...prevOlderMessages,
        ]);
        lastVisibleMessageRef.current = olderMessages[0];
        messagesContainerRef.current.scrollTop = 1;
      } catch (error) {
        console.error("Error loading older messages:", error);
      }
    }
  };

  useEffect(() => {
    // Event listener for scrolling
    const handleScroll = () => {
      if (
        messagesContainerRef.current &&
        messagesContainerRef.current.scrollTop === 0
      ) {
        loadOlderMessages();
      }
    };

    messagesContainerRef.current.addEventListener("scroll", handleScroll);

    return () => {
      // Check if messagesContainerRef.current is not null before removing the event listener
      if (messagesContainerRef.current) {
        messagesContainerRef.current.removeEventListener(
          "scroll",
          handleScroll
        );
      }
    };
  }, []);

  const [usernamesMap, setUsernamesMap] = useState(new Map());

  // Function to get username from UID, checking the map first
  const getUserName = async (uid) => {
    if (usernamesMap.has(uid)) {
      return usernamesMap.get(uid);
    } else {
      const username = await getUserNameFromUid(uid);
      setUsernamesMap(new Map(usernamesMap.set(uid, username)));
      return username;
    }
  };

  // Fetch first new messages
  useEffect(() => {
    // Reset state when room changes
    setMessages([]);
    setOlderMessages([]);
    setNewMessage("");
    setLoading(true); // Set loading to true when room changes
    lastVisibleMessageRef.current = null;
    // Fetch new messages
    const queryMessages = query(
      messagesRef,
      where("room", "==", room),
      orderBy("createdAt", "desc"),
      limit(messageBatch)
    );

    const unsubscribe = onSnapshot(queryMessages, async (snapshot) => {
      let newMessages = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      for (let i = 0; i < newMessages.length; i++) {
        newMessages[i].userName = await getUserName(newMessages[i].uid);
      }

      setMessages(newMessages.reverse());
      lastVisibleMessageRef.current = newMessages[0];
      setLoading(false); // Set loading back to false when snapshot is received
    });

    return () => unsubscribe();
  }, [room]);

  useEffect(() => {
    // Scroll to bottom on new messages
    scrollToBottom();
  }, [messages]);

  // Function to handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newMessage === "") return;

    const lastMessage = messages[messages.length - 1];
    const sameUser = lastMessage && lastMessage.uid === auth.currentUser.uid;

    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: auth.currentUser.uid,
      photoURL: sameUser ? null : auth.currentUser.photoURL,
      room,
    });

    setNewMessage("");
    scrollToBottom();
  };

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  };

  const formatMessageDate = (date) => {
    return date ? format(date, "EEEE d") : "Today";
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {loading && (
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            alignSelf: "flex-end",
            width: "100%",
            height: "100%",
          }}
        >
          <MessageSkeleton />
        </Box>
      )}
      <Box
        ref={messagesContainerRef}
        sx={{
          flexGrow: 1,
          overflow: "auto",
          alignSelf: "flex-end",
          width: "100%",
        }}
      >
        {[...olderMessages, ...messages]
          .filter((message) => message.createdAt) // Filter out messages without createdAt
          .sort((a, b) => (a.createdAt.seconds > b.createdAt.seconds ? 1 : -1))
          .map((message, index, array) => (
            <React.Fragment key={message.id}>
              {index === 0 ||
              array[index - 1]?.createdAt?.toDate()?.toDateString() !==
                message.createdAt?.toDate()?.toDateString() ? (
                <Divider>
                  <Typography
                    variant="subtitle1"
                    align="center"
                    color="textSecondary"
                    gutterBottom
                  >
                    {formatMessageDate(message.createdAt?.seconds * 1000)}
                  </Typography>
                </Divider>
              ) : null}
              <Message
                {...message}
                photoURL={
                  index === 0 || array[index - 1]?.uid !== message.uid
                    ? message.photoURL
                    : null
                }
              />
            </React.Fragment>
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

export default Chat;
