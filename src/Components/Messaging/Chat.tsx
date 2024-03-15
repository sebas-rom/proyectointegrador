import React, { useState, useEffect, useRef } from "react";
import { db, auth, getUserData } from "../../Contexts/Session/Firebase.tsx";
import {
  collection,
  addDoc,
  where,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  Box,
  Divider,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Message from "./Message.tsx";
import {
  formatMessageDate,
  isSameDay,
  markMessagesAsRead,
} from "./ChatUtils.tsx";
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
  const [loading, setLoading] = useState(true); // Added loading state
  const [scrollFlag, setScrollFlag] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false); // Added state for sending messages
  const lastVisibleMessageRef = useRef(null);
  const newestMessageRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousScrollTop = useRef(0);

  // Initialize a cache object to store already fetched user info
  let userInfoCache = {};
  // Initialize a map to track if a UID is being fetched
  const userInfoFetchingMap = new Map();
  // Function to get username and photo URL from UID, checking the cache first
  const getUserInfo = async (uid) => {
    try {
      // Check if the user info is already cached
      if (userInfoCache[uid]) {
        return userInfoCache[uid];
      }
      // If the UID is being fetched, wait for the existing fetch to complete
      if (userInfoFetchingMap.has(uid)) {
        return userInfoFetchingMap.get(uid);
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
      userInfoFetchingMap.set(uid, fetchPromise);
      // When the fetch is complete, remove the promise from the fetching map
      fetchPromise.finally(() => {
        userInfoFetchingMap.delete(uid);
      });
      // Return the promise
      return fetchPromise;
    } catch (error) {
      console.error("Error getting user info:", error);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setNewMessage("");
    setLoading(true);
    setScrollFlag(false);
    setIsSendingMessage(false);
    lastVisibleMessageRef.current = null;
    newestMessageRef.current = null;
    previousScrollTop.current = 0;
  };

  // Function to process new messages
  async function processMessages(newMessages) {
    try {
      const unreadMessages = newMessages.filter(
        (message) =>
          message.read && message.read[auth.currentUser.uid] === false
      );

      if (unreadMessages.length) {
        markMessagesAsRead(unreadMessages, room);
      }

      for (const message of newMessages) {
        const userInfo = await getUserInfo(message.uid);
        message.userName = userInfo.username;
        message.photoURL = userInfo.photoURL;
      }

      setMessages((prevMessages) => {
        const existingIds = new Set(prevMessages.map((msg) => msg.id));
        const nonDuplicateMessages = newMessages
          .filter((msg) => !existingIds.has(msg.id))
          .sort((a, b) => a.createdAt.seconds - b.createdAt.seconds);
        return [...nonDuplicateMessages, ...prevMessages];
      });
    } catch (error) {
      console.error("Error processing messages:", error);
    }
  }
  // Fetch new messages
  useEffect(() => {
    // Reset state when room changes
    let unsubscribe;
    resetChat();
    const fetchDataAndListen = async () => {
      try {
        await fetchMessages();
        setLoading(false);
        const queryMessages = query(
          messagesRef,
          orderBy("createdAt", "desc"),
          where("createdAt", ">", newestMessageRef.current.createdAt),
          limit(messageBatch)
        );
        unsubscribe = onSnapshot(queryMessages, async (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => ({
            ...(doc.data() as MessageData),
            id: doc.id,
          }));
          setScrollFlag(false);
          await processMessages(newMessages);
          newestMessageRef.current =
            newMessages.length > 0 ? newMessages[0] : newestMessageRef.current;
        });
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    fetchDataAndListen();

    return () => {
      if (unsubscribe) {
        unsubscribe(); // Proper unsubscribe if we have a reference to the function.
      }
    };
  }, [room]);

  // Fetch messages with starting point (optimized)
  const fetchMessages = async (startingAfter = null) => {
    const messagesRef2 = collection(db, "chatrooms", room, "messages");
    const queryMessages = query(
      messagesRef2,
      orderBy("createdAt", "desc"),
      startingAfter
        ? where("createdAt", "<", startingAfter)
        : limit(messageBatch)
    );

    try {
      const snapshot = await getDocs(queryMessages);
      const newMessages: MessageData[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as MessageData),
        id: doc.id,
      }));

      await processMessages(newMessages);
      lastVisibleMessageRef.current =
        newMessages.length > 0 ? newMessages[newMessages.length - 1] : null;
      if (startingAfter == null) {
        newestMessageRef.current = newMessages[0];
      } else {
        //keep scroll here
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  };

  // Function to handle form submission
  const sendMessage = async (event) => {
    event.preventDefault();
    if (newMessage === "") return;
    setNewMessage("");

    try {
      setIsSendingMessage(true);
      const chatRoomDocRef = doc(db, "chatrooms", room);
      const chatRoomSnapshot = await getDoc(chatRoomDocRef);
      let members = [];
      if (chatRoomSnapshot.exists()) {
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
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // fetch older messages when scrolling to the top
  useEffect(() => {
    // Load older messages (using fetchMessages)
    const loadOlderMessages = async () => {
      const lastVisibleMessage = lastVisibleMessageRef.current;
      if (lastVisibleMessage) {
        await fetchMessages(lastVisibleMessage.createdAt);
      }
    };
    const messagesContainer = messagesContainerRef.current;
    const handleScroll = () => {
      if (messagesContainer.scrollTop === 0) {
        loadOlderMessages();
      }
    };
    messagesContainer.addEventListener("scroll", handleScroll);

    return () => {
      messagesContainer.removeEventListener("scroll", handleScroll);
    };
  }, [messagesContainerRef, room]);

  // Scroll to bottom when messages are first rendered or keep scroll position when older messages are loaded
  useEffect(() => {
    if (messages.length > 0 && !scrollFlag) {
      scrollToBottom();
      setScrollFlag(true);
      previousScrollTop.current = messagesContainerRef.current.scrollHeight;
    } else if (scrollFlag) {
      const diff =
        messagesContainerRef.current.scrollHeight - previousScrollTop.current;

      if (diff > 0) {
        messagesContainerRef.current.scrollTop = diff;
      }
      previousScrollTop.current = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
        {/* {!loading && messages.length >= messageBatch && (
          <Stack alignContent={"center"} alignItems={"center"} padding={2}>
            <Button onClick={loadOlderMessages} variant="contained">
              Load older messages
            </Button>
          </Stack>
        )} */}

        {messages
          .sort((a, b) => a.createdAt.seconds - b.createdAt.seconds)
          .map((message, index, array) => {
            const messageDate = message.createdAt?.toDate();
            const prevMessageDate = array[index - 1]?.createdAt?.toDate();
            const sameUserAsPrev = array[index - 1]?.uid === message.uid;
            const showDateSeparator =
              index === 0 || !isSameDay(messageDate, prevMessageDate);

            return (
              <React.Fragment key={message.id}>
                {showDateSeparator && (
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
                )}
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
        onSubmit={sendMessage}
        elevation={3}
      >
        <Stack direction={"row"} alignItems={"center"}>
          <InputBase
            sx={{
              width: "100%",
              maxHeight: "300px",
              overflowY: "auto", // Enable vertical scrollbar
              padding: 1,
            }}
            id="message-input"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder="Type your message here..."
            disabled={isSendingMessage} // Disable input while sending
            multiline
          />

          <Divider orientation="vertical" flexItem variant="middle" />
          <IconButton
            color="primary"
            sx={{ p: "10px" }}
            aria-label="directions"
            onClick={sendMessage}
          >
            <SendIcon />
          </IconButton>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Chat;
