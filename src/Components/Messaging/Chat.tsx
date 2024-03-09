import React, { useState, useEffect, useRef } from "react";
import { db, auth, getUserData } from "../../Contexts/Session/Firebase.tsx";
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
  doc,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import {
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Message from "./Message.tsx";
import { formatMessageDate } from "./ChatUtils.tsx";
import MessageSkeleton from "./MessageSkeleton.tsx";
import { MessageData } from "../../Contexts/Session/Firebase.tsx";
//
//
// no-Docs-yet
//
//

//TODO
//test on mobile
//add end to end encrpytion
const Chat = ({ room }) => {
  const messageBatch = 25;
  const messagesRef = collection(db, "chatrooms", room, "messages");
  const [messages, setMessages] = useState([]); //make the message data type
  const [newMessage, setNewMessage] = useState("");
  const lastVisibleMessageRef = useRef(null);
  const [olderMessages, setOlderMessages] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const messagesContainerRef = useRef(null);
  const lastVisibleTimeStamp = useRef(null);

  // Initialize a cache object to store already fetched user info
  const userInfoCache = {};
  // Initialize a map to track if a UID is being fetched
  const fetchingMap = new Map();
  // Function to get username and photo URL from UID, checking the cache first
  const getUserInfo = async (uid) => {
    // Check if the user info is already cached
    if (userInfoCache[uid]) {
      return userInfoCache[uid];
    }
    // If the UID is being fetched, wait for the existing fetch to complete
    if (fetchingMap.has(uid)) {
      return fetchingMap.get(uid);
    }
    // Otherwise, mark the UID as being fetched
    const fetchPromise = new Promise(async (resolve) => {
      let username, photoURL;
      // If the UID matches the current user's UID, use the current user's info
      if (uid === auth.currentUser.uid) {
        username = auth.currentUser.displayName;
        photoURL = auth.currentUser.photoURL;
      } else {
        // Fetch user data from backend
        const userData = await getUserData(uid);
        username = `${userData.firstName} ${userData.lastName}`;
        photoURL = userData.photoURL;
      }
      const userInfo = { username, photoURL };
      // Cache the fetched user info
      userInfoCache[uid] = userInfo;
      // Resolve the promise with the user info
      resolve(userInfo);
    });

    // Store the promise in the fetching map
    fetchingMap.set(uid, fetchPromise);
    // When the fetch is complete, remove the promise from the fetching map
    fetchPromise.finally(() => {
      fetchingMap.delete(uid);
    });
    // Return the promise
    return fetchPromise;
  };

  const markMessagesAsRead = async (unreadMessages) => {
    const batch = writeBatch(db);
    unreadMessages.forEach((message) => {
      const messageRef = doc(db, "chatrooms", room, "messages", message.id);
      batch.update(messageRef, {
        [`read.${auth.currentUser.uid}`]: true,
      });
    });

    await batch.commit();
  };

  // Fetch new messages
  useEffect(() => {
    // Reset state when room changes
    setLoading(true);
    setMessages([]);
    setNewMessage("");
    setOlderMessages([]);

    // Fetch new messages
    const queryMessages = query(
      messagesRef,
      orderBy("createdAt", "desc"),
      limit(messageBatch)
    );

    const unsubscribe = onSnapshot(queryMessages, async (snapshot) => {
      setMessages([]);
      setNewMessage("");
      setOlderMessages([]);

      const newMessages: MessageData[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as MessageData),
        id: doc.id,
      }));

      // Filter out already read messages by current user and mark them as read
      const unreadMessages = newMessages.filter(
        (message) =>
          message.read && message.read[auth.currentUser.uid] === false
      );

      if (unreadMessages.length) {
        markMessagesAsRead(unreadMessages);
      }

      for (let i = 0; i < newMessages.length; i++) {
        const userInfo = await getUserInfo(newMessages[i].uid);
        newMessages[i].userName = userInfo.username;
        newMessages[i].photoURL = userInfo.photoURL;
      }
      const lastVisibleMessage = newMessages[newMessages.length - 1]; // Get the oldest visible message
      console.log("lastVisibleMessage", lastVisibleMessage);
      lastVisibleTimeStamp.current = lastVisibleMessage?.createdAt;
      console.log("lastVisibleTimestamp", lastVisibleTimeStamp.current);
      setMessages(newMessages);
      lastVisibleMessageRef.current = newMessages[newMessages.length - 1];
      setLoading(false); // Set loading back to false when snapshot is received
    });

    return () => unsubscribe();
  }, [room]);

  // Function to load older messages
  const loadOlderMessages = async () => {
    const lastVisibleMessage = lastVisibleMessageRef.current;
    const lastVisibleTimestamp = lastVisibleMessage?.createdAt;

    if (lastVisibleTimestamp) {
      const queryOldMessages = query(
        messagesRef,
        where("createdAt", "<", lastVisibleTimestamp),
        orderBy("createdAt", "desc"),
        limit(messageBatch)
      );

      try {
        const snapshot = await getDocs(queryOldMessages);
        const olderMessages: MessageData[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as MessageData),
          id: doc.id,
        }));

        if (olderMessages.length === 0) {
          console.log("No more messages");
          return;
        }

        for (let i = 0; i < olderMessages.length; i++) {
          const userInfo = await getUserInfo(olderMessages[i].uid);

          olderMessages[i].userName = userInfo.username;

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

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  };

  useEffect(() => {
    // Scroll to bottom on new messages
    scrollToBottom();
  }, [messages]);

  // Function to handle form submission
  const sendMessage = async (event) => {
    event.preventDefault();
    if (newMessage === "") return;

    const chatRoomDocRef = doc(db, "chatrooms", room);
    const chatRoomSnapshot = await getDoc(chatRoomDocRef);
    let members = [];
    if (chatRoomSnapshot.exists()) {
      console.log("Document data:", chatRoomSnapshot.data().members);
      members = chatRoomSnapshot.data().members;
    }

    const readStatus = {};
    members.forEach((member) => {
      if (member !== auth.currentUser.uid) {
        readStatus[member] = false;
      } else {
        readStatus[member] = true;
      }
    });

    await addDoc(messagesRef, {
      room,
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: auth.currentUser.uid,
      read: readStatus, //add other users of the chat room here to false
    });

    setNewMessage("");
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "85%",
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
        {!loading && messages.length >= messageBatch && (
          <Stack alignContent={"center"} alignItems={"center"} padding={2}>
            <Button onClick={loadOlderMessages} variant="contained">
              Load older messages
            </Button>
          </Stack>
        )}

        {[...olderMessages, ...messages]
          .filter((message) => message.createdAt)
          .sort((a, b) => a.createdAt.seconds - b.createdAt.seconds)
          .map((message, index, array) => {
            const currentDate = message.createdAt?.toDate()?.toDateString();
            const prevDate = array[index - 1]?.createdAt
              ?.toDate()
              ?.toDateString();
            const sameUserAsPrev =
              array[index - 1]?.uid === message.uid && prevDate === currentDate;

            return (
              <React.Fragment key={message.id}>
                {index === 0 ||
                  (prevDate !== currentDate && (
                    <Divider>
                      <Typography
                        variant="subtitle1"
                        align="center"
                        color="textSecondary"
                        gutterBottom
                      >
                        {formatMessageDate(message.createdAt.seconds * 1000)}
                      </Typography>
                    </Divider>
                  ))}
                {!sameUserAsPrev && (
                  <Message {...message} photoURL={message.photoURL} />
                )}
                {sameUserAsPrev && (
                  <Message {...message} photoURL="no-display" userName="" />
                )}
              </React.Fragment>
            );
          })}
      </Box>
      {/* send  */}
      <Paper
        component="form"
        id="message-form"
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
          id="message-input"
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
