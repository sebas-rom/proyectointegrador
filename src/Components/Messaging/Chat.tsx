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
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Message from "./Message.tsx";
import { format } from "date-fns";
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
  // if (!room) return;

  const messageBatch = 25;
  const messagesRef = collection(db, "chatrooms", room, "messages");
  const [messages, setMessages] = useState([]); //make the message data type
  const [newMessage, setNewMessage] = useState("");
  const [lastRenderedDate, setLastRenderedDate] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const lastVisibleMessageRef = useRef(null);
  const messagesContainerRef = useRef(null);

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

    batch.commit();
  };

  // Fetch new messages
  useEffect(() => {
    // Reset state when room changes
    setLoading(true);
    setMessages([]);
    setNewMessage("");

    // Fetch new messages
    const queryMessages = query(
      messagesRef,
      orderBy("createdAt", "desc"),
      limit(messageBatch)
    );

    const unsubscribe = onSnapshot(queryMessages, async (snapshot) => {
      setMessages([]);
      setNewMessage("");

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

      setMessages(newMessages.reverse());

      lastVisibleMessageRef.current = newMessages[0];

      setLoading(false); // Set loading back to false when snapshot is received
    });

    return () => unsubscribe();
  }, [room]);

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
      if (member !== auth.currentUser.uid) readStatus[member] = false;
      else readStatus[member] = true;
    });

    await addDoc(messagesRef, {
      room,
      text: newMessage,
      createdAt: serverTimestamp(),
      uid: auth.currentUser.uid,
      read: { readStatus }, //add other users of the chat room here to false
    });

    setNewMessage("");
  };

  const formatMessageDate = (date) => {
    return date ? format(date, "EEEE d") : "Today";
  };
  const [open, setOpen] = React.useState(false);

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
        <Snackbar
          open={open}
          autoHideDuration={5000}
          message="No older messages"
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        />
        {[...messages]
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
      {/* send  */}
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
