import React, { useState, useEffect, useRef } from "react";
import {
  db,
  auth,
  getUserInfoFromUid,
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
  Button,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Message from "./Message.tsx";
import { format, set } from "date-fns";
import MessageSkeleton from "./MessageSkeleton.tsx";

//TODO
//test on mobile
//add end to end encrpytion
const Chat = ({ room }) => {
  if (!room) return;

  const messageBatch = 25;
  const [messages, setMessages] = useState([]);
  const [olderMessages, setOlderMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesRef = collection(db, "messages");
  const lastVisibleMessageRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const [usernamesMap, setUsernamesMap] = useState(new Map());
  // const [receivingMessages, setReceivingMessages] = useState(false);

  // Function to get username and photo URL from UID, checking the map first
  const getUserInfo = async (uid) => {
    if (usernamesMap.has(uid)) {
      return usernamesMap.get(uid);
    } else {
      const [username, photoURL] = await getUserInfoFromUid(uid);
      const userInfo = { username, photoURL };
      setUsernamesMap(new Map(usernamesMap.set(uid, userInfo)));
      return userInfo;
    }
  };

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

        if (olderMessages.length === 0) {
          console.log("No more messages");
          setOpen(true);
          return;
        }

        for (let i = 0; i < olderMessages.length; i++) {
          //@ts-ignore
          const userInfo = await getUserInfo(olderMessages[i].uid);
          //@ts-ignore
          olderMessages[i].userName = userInfo.username;
          //@ts-ignore
          olderMessages[i].photoURL = userInfo.photoURL;
        }

        setOlderMessages((prevOlderMessages) => [
          ...olderMessages.reverse(),
          ...prevOlderMessages,
        ]);
        lastVisibleMessageRef.current = olderMessages[0];

        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight / 10 + 5; // adjust scroll here
      } catch (error) {
        console.error("Error loading older messages:", error);
      }
    }
  };

  // Fetch new messages
  useEffect(() => {
    // Reset state when room changes
    setLoading(true);
    setMessages([]);
    setOlderMessages([]);
    setNewMessage("");

    // Fetch new messages
    const queryMessages = query(
      messagesRef,
      where("room", "==", room),
      orderBy("createdAt", "desc"),
      limit(messageBatch)
    );

    const unsubscribe = onSnapshot(queryMessages, async (snapshot) => {
      setMessages([]);
      setOlderMessages([]);
      setNewMessage("");

      let newMessages = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      for (let i = 0; i < newMessages.length; i++) {
        //@ts-ignore
        const userInfo = await getUserInfo(newMessages[i].uid);
        //@ts-ignore
        newMessages[i].userName = userInfo.username;
        //@ts-ignore
        newMessages[i].photoURL = userInfo.photoURL;
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
  const sendMessage = async (event) => {
    event.preventDefault();

    if (newMessage === "") return;

    const lastMessage = messages[messages.length - 1];
    const sameUser = lastMessage && lastMessage.uid === auth.currentUser.uid;

    await addDoc(messagesRef, {
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: auth.currentUser.uid,
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
  const [open, setOpen] = React.useState(false);

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
        <Snackbar
          open={open}
          autoHideDuration={5000}
          message="No older messages"
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
        {!loading && messages.length >= messageBatch && (
          <Stack alignContent={"center"} alignItems={"center"}>
            <Button onClick={loadOlderMessages} variant="contained">
              Load older messages
            </Button>
          </Stack>
        )}
        {[...olderMessages, ...messages]
          .filter((message) => message.createdAt)
          .sort((a, b) => (a.createdAt.seconds > b.createdAt.seconds ? 1 : -1))
          .map((message, index, array) => (
            <React.Fragment key={message.id}>
              {(index === 0 ||
                array[index - 1]?.createdAt?.toDate()?.toDateString() !==
                  message.createdAt?.toDate()?.toDateString() ||
                array[index - 1]?.uid !== message.uid) && (
                <>
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
                  <Message {...message} photoURL={message.photoURL} />
                </>
              )}
              {index !== 0 &&
                array[index - 1]?.createdAt?.toDate()?.toDateString() ===
                  message.createdAt?.toDate()?.toDateString() &&
                array[index - 1]?.uid === message.uid && (
                  <Message {...message} photoURL="no-display" userName="" />
                )}
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
        onSubmit={sendMessage}
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
          onClick={sendMessage}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
};

export default Chat;
