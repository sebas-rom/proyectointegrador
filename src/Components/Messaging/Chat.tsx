import React, { useState, useEffect, useRef } from "react";
import {
  db,
  auth,
  getUserData,
  CHATROOM_COLLECTION,
  MESSAGES_COLLECTION,
  sendMessageToChat,
  ChatRoomData,
  CONTRACTS_COLLECTION,
  isFreelancer,
  getChatRoomData,
  storage,
  FileMetadata,
  MilestoneData,
} from "../../Contexts/Session/Firebase.tsx";
import { collection, where, query, orderBy, limit, getDocs, onSnapshot, doc, addDoc } from "firebase/firestore";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  LinearProgress,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import Message from "./MessageTypes/Message.tsx";
import { formatMessageDate, generateUniqueFileName, markMessagesAsRead } from "./ChatUtils.tsx";
import MessageSkeleton from "./MessageTypes/MessageSkeleton.tsx";
import { MessageData } from "../../Contexts/Session/Firebase.tsx";
import ContractProposedMessage from "./MessageTypes/ContractProposedMessage.tsx";
import NewChatMessage from "./MessageTypes/ChatStartedMessage.tsx";
import { Link, useNavigate } from "react-router-dom";
import { useFeedback } from "../../Contexts/Feedback/FeedbackContext.tsx";
import StatusUpdateMessage from "./MessageTypes/StatusUpdateMessage.tsx";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import { getDownloadURL, ref, uploadBytesResumable } from "@firebase/storage";
import FileMessage from "./MessageTypes/FileMessage.tsx";
import BorderText from "../DataDisplay/BorderText.tsx";
import { isSameDay, set } from "date-fns";
import CustomPaper from "../DataDisplay/CustomPaper.tsx";
import ContractStatusMessage from "./MessageTypes/ContractStatusMessage.tsx";
import { calcMilestoneAmmounts } from "../Routes/Session/ViewContract.tsx";
import MilestonesProposedMessage from "./MessageTypes/MilestonesProposedMessage.tsx";
//
//
// no-Docs-yet
// break into smaller components
//

type MilestoneStatus = "no-escrow" | "escrow-funded" | "milestones-completed";

const MESSAGES_BATCH_SIZE = 25;

const Chat = ({ room }) => {
  const [chatData, setChatData] = useState<ChatRoomData>(); //make the chat data type
  const [messages, setMessages] = useState([]); //make the message data type
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true); // Added loading state
  const [scrollFlag, setScrollFlag] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false); // Added state for sending messages
  const lastVisibleMessageRef = useRef(null);
  const newestMessageRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousScrollTop = useRef(0);
  const userInfoCache = {}; // Cache object to store already fetched user info
  const userInfoFetchingMap = new Map(); // Map to track if a UID is being fetched
  const navigate = useNavigate();
  const { showSnackbar } = useFeedback();
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  // const [milestonesOnEscrow, setMilestonesOnEscrow] = useState(true);
  const [milestonesStatus, setMilestonesStatus] = useState<MilestoneStatus>(); // no-escrow escrow-funded milestones-completed
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  // Check if the chat shas pending milestones not on escrow
  useEffect(() => {
    const asyncContainer = async () => {
      const milestonesAmmount = calcMilestoneAmmounts(milestones);
      if (milestonesAmmount.inEscrow > 0) {
        setMilestonesStatus("escrow-funded");
      } else {
        if (milestonesAmmount.paid == milestonesAmmount.total) {
          setMilestonesStatus("milestones-completed");
        } else {
          setMilestonesStatus("no-escrow");
          if (await isFreelancer(auth.currentUser.uid)) {
            showSnackbar(
              "You have an active contract, but there are no milestones on Scrow. You should not start working until the client funds a milsetone. Go to 'View Contract' to know more.",
              "warning",
              "right",
              "bottom",
              false,
            );
          } else {
            showSnackbar(
              "This contract has no active milestones. Go to 'View Contract' to fund a milestone so the freelancer can start working.",
              "warning",
              "right",
              "bottom",
              false,
            );
          }
        }
      }
    };
    if (milestones.length > 0) {
      asyncContainer();
    }

    //Avoid rerendering the component on shwoSnackbar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [milestones]);

  // Room initialization
  useEffect(() => {
    resetChat();

    let unsubscribeMessages;
    let unsubscribeChat;
    let unsubscribeMilestones;

    const fetchMilestones = (currentContractId) => {
      const milestonesRef = collection(db, `contracts/${currentContractId}/milestones`);
      unsubscribeMilestones = onSnapshot(milestonesRef, (docs) => {
        const tempMilestones = docs.docs.map((doc) => ({
          ...(doc.data() as MilestoneData),
          id: doc.id,
        }));
        setMilestones(tempMilestones);
      });
    };

    const fetchDataAndListen = async () => {
      try {
        unsubscribeChat = await onSnapshot(
          doc(db, CHATROOM_COLLECTION, room),
          async (doc) => {
            const tempChatData = doc.data() as ChatRoomData;
            setChatData(tempChatData);
            if (tempChatData.contractHistory === "activeContract" && tempChatData.currentContractId) {
              fetchMilestones(tempChatData.currentContractId);
            }
          },
          (error) => {
            const message = "Error loading chat data " + error.message;
            showSnackbar(message, "error");
          },
        );

        await fetchMessages();

        const queryMessages = query(
          collection(db, CHATROOM_COLLECTION, room, MESSAGES_COLLECTION),
          orderBy("createdAt", "desc"),
          where("createdAt", ">", newestMessageRef.current.createdAt),
          limit(MESSAGES_BATCH_SIZE),
        );
        unsubscribeMessages = onSnapshot(queryMessages, async (snapshot) => {
          const newMessages = snapshot.docs.map((doc) => ({
            ...(doc.data() as MessageData),
            id: doc.id,
          }));
          setScrollFlag(false);
          await processMessages(newMessages);
          newestMessageRef.current = newMessages.length > 0 ? newMessages[0] : newestMessageRef.current;
        });
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    fetchDataAndListen();

    return () => {
      if (unsubscribeMessages) {
        unsubscribeMessages(); // Proper unsubscribe if we have a reference to the function.
      }
      if (unsubscribeChat) {
        unsubscribeChat();
      }
      if (unsubscribeMilestones) {
        unsubscribeMilestones();
      }
    };
    //Avoid rerendering the component on missing dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  // fetch older messages when scrolling up
  useEffect(() => {
    let isLoadingOlderMsg = false; // Flag to track loading state

    const loadOlderMessages = async () => {
      if (isLoadingOlderMsg) return; // Exit if already loading
      isLoadingOlderMsg = true;

      const lastVisibleMessage = lastVisibleMessageRef.current;

      try {
        if (lastVisibleMessage) {
          setLoadingOlderMessages(true);
          await fetchMessages(lastVisibleMessage.createdAt);
          setLoadingOlderMessages(false);
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        isLoadingOlderMsg = false; // Reset flag even if an error occurs or no older messages
      }
    };

    const messageContainer = messagesContainerRef.current;
    const handleScroll = async () => {
      if (messageContainer.scrollTop < 250 && !isLoadingOlderMsg && !loading) {
        loadOlderMessages();
      }
    };
    messageContainer.addEventListener("scroll", handleScroll);

    return () => {
      messageContainer.removeEventListener("scroll", handleScroll);
    };
    //Avoid rerendering the component on missing dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesContainerRef, room, loading]);

  // Scroll to bottom when messages are first rendered or keep scroll position when older messages are loaded
  useEffect(() => {
    if (messages.length > 0 && !scrollFlag) {
      scrollToBottom();
      setScrollFlag(true);
      previousScrollTop.current = messagesContainerRef.current.scrollHeight;
    } else if (scrollFlag) {
      const diff = messagesContainerRef.current.scrollHeight - previousScrollTop.current;

      if (diff > 0) {
        messagesContainerRef.current.scrollTop = diff;
      }
      previousScrollTop.current = messagesContainerRef.current.scrollHeight;
    }
    //Avoid rerendering the component on missing dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  const scrollToBottom = () => {
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
    });
  };

  const resetChat = () => {
    setChatData(null);
    setMessages([]);
    setNewMessage("");
    setLoading(true);
    setScrollFlag(false);
    setIsSendingMessage(false);
    lastVisibleMessageRef.current = null;
    newestMessageRef.current = null;
    previousScrollTop.current = 0;
  };

  //Get username and photo URL from UID, checking cache first
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
        // Fetch user data from backend
        const userData = await getUserData(uid);
        const username = `${userData.firstName} ${userData.lastName}`;
        const photoURL = userData.photoThumbURL || userData.photoURL;
        const userInfo = {
          username,
          photoURL,
        };
        userInfoCache[uid] = userInfo;
        resolve(userInfo);
      });
      userInfoFetchingMap.set(uid, fetchPromise);
      fetchPromise.finally(() => {
        userInfoFetchingMap.delete(uid);
      });
      return fetchPromise;
    } catch (error) {
      console.error("Error getting user info:", error);
    }
  };

  // Fetch messages with starting point
  const fetchMessages = async (startingAfter = null) => {
    const queryMessages = query(
      collection(db, CHATROOM_COLLECTION, room, MESSAGES_COLLECTION),
      orderBy("createdAt", "desc"),
      startingAfter ? where("createdAt", "<", startingAfter) : limit(MESSAGES_BATCH_SIZE),
    );

    try {
      const snapshot = await getDocs(queryMessages);
      const newMessages: MessageData[] = snapshot.docs.map((doc) => ({
        ...(doc.data() as MessageData),
        id: doc.id,
      }));

      await processMessages(newMessages);
      lastVisibleMessageRef.current = newMessages.length > 0 ? newMessages[newMessages.length - 1] : null;
      if (startingAfter == null) {
        newestMessageRef.current = newMessages[0];
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (newMessage === "") return;
    try {
      setIsSendingMessage(true);
      await sendMessageToChat(room, newMessage);
      setNewMessage("");
      setIsSendingMessage(false);
    } catch (error) {
      showSnackbar("Error sending message", "error");
      setNewMessage("");
      setIsSendingMessage(false);
    }
  };

  // Function to process messages - mark as read - get userInfo and add to state
  async function processMessages(newMessages) {
    try {
      const unreadMessages = newMessages.filter((message) => !message.read || !message.read[auth.currentUser.uid]);

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

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent default form submission behavior
      sendMessage(event);
    }
  };

  const handleClickProposeContract = async () => {
    const chatData = (await getChatRoomData(room)) as ChatRoomData;
    const newContractRef = collection(db, CONTRACTS_COLLECTION);
    try {
      const isCurrentUserFreelancer = await isFreelancer(auth.currentUser.uid);
      const otherUser = chatData.members.find((member) => member !== auth.currentUser.uid);
      const otherUserIsFreelancer = await isFreelancer(otherUser);
      if (isCurrentUserFreelancer === otherUserIsFreelancer) {
        showSnackbar("Error proposing contract: both users are the same type", "error");
        return;
      }
      let freelancerUid;
      let clientUid;
      if (isCurrentUserFreelancer) {
        freelancerUid = auth.currentUser.uid;
        clientUid = otherUser;
      } else {
        freelancerUid = otherUser;
        clientUid = auth.currentUser.uid;
      }

      const docSnap = await addDoc(newContractRef, {
        freelancerUid: freelancerUid,
        clientUid: clientUid,
        proposedBy: auth.currentUser.uid,
        chatRoomId: room,
        status: "pending",
      });
      navigate(`/propose-contract/${docSnap.id}`);
    } catch (error) {
      console.error("Error reserving contract ID:", error);
    }
  };

  //Handle file sending
  const [uploadProgress, setUploadProgress] = useState(null);
  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsSendingMessage(true);
      const fileRef = ref(storage, `messages/files/${auth.currentUser.uid}/${generateUniqueFileName(file.name)}`);
      const metadata: FileMetadata = {
        contentType: file.type,
        fileName: file.name,
      };
      // Upload file
      const uploadTask = uploadBytesResumable(fileRef, file, metadata);
      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progress > 90) {
            progress = 95;
          }
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          showSnackbar("Error uploading file", "error");
        }, //
        async () => {
          // Handle successful uploads on complete
          const url = await getDownloadURL(fileRef);
          // console.log("Upload successful:", url);
          setUploadProgress(null);
          await sendMessageToChat(room, url, "file", metadata);
          setIsSendingMessage(false);
        },
      );
    }
  };

  return (
    <>
      <Divider />
      <Stack
        direction={"row"}
        justifyContent={"flex-end"}
        sx={{
          marginRight: 1,
        }}
      >
        {!loading ? (
          <>
            {chatData?.status === "active" && (
              <>
                {chatData.contractHistory === "activeContract" && (
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    width={"100%"}
                    sx={{
                      paddingLeft: 1,
                    }}
                  >
                    {milestonesStatus === "milestones-completed" && (
                      <BorderText color="info" text="Milestones completed" />
                    )}
                    {milestonesStatus === "no-escrow" && <BorderText color="error" text="No funds on Escrow" />}
                    {milestonesStatus === "escrow-funded" && <BorderText color="success" text="Escrow funded" />}

                    <Link to={`/view-contract/${chatData.currentContractId}`} target="_blank">
                      <Button>View Contract</Button>
                    </Link>
                  </Stack>
                )}
                {chatData.contractHistory === "noContract" && (
                  <Button onClick={handleClickProposeContract}>Propose Contract</Button>
                )}
                {chatData.contractHistory === "completedContract" && (
                  <Stack
                    direction={"row"}
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    width={"100%"}
                    sx={{
                      paddingLeft: 1,
                    }}
                  >
                    <BorderText color="info" text="Contract Ended" />
                    <Button>Propose New Contract</Button>
                    <Link to={`/view-contract/${chatData.currentContractId}`} target="_blank">
                      <Button>View Contract</Button>
                    </Link>
                  </Stack>
                )}
              </>
            )}
          </>
        ) : (
          <Button>
            <Skeleton width={300}></Skeleton>
          </Button>
        )}
      </Stack>
      <Divider />

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

        {loadingOlderMessages && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
            }}
          >
            <Stack
              direction={"row"}
              alignItems={"center"}
              justifyContent={"center"}
              spacing={2}
              sx={{
                marginTop: "5px",
              }}
            >
              <CircularProgress />
            </Stack>
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
          {messages
            .sort((a, b) => a.createdAt.seconds - b.createdAt.seconds)
            .map((message, index, array) => {
              const messageDate = message.createdAt?.toDate();
              const prevMessageDate = array[index - 1]?.createdAt?.toDate();
              const sameUserAsPrev = array[index - 1]?.uid === message.uid;
              const showDateSeparator = index === 0 || !isSameDay(messageDate, prevMessageDate);
              const messageType = message.type || "text";
              return (
                <React.Fragment key={message.id}>
                  {showDateSeparator && (
                    <Divider>
                      <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
                        {formatMessageDate(message.createdAt.seconds * 1000)}
                      </Typography>
                    </Divider>
                  )}
                  {!sameUserAsPrev && messageType === "text" && <Message {...message} />}
                  {sameUserAsPrev && messageType === "text" && (
                    <Message {...message} photoURL="no-display" userName="" />
                  )}
                  {!sameUserAsPrev && messageType === "file" && <FileMessage {...message} />}
                  {sameUserAsPrev && messageType === "file" && (
                    <FileMessage {...message} photoURL="no-display" userName="" />
                  )}
                  {messageType === "contract" && (
                    <ContractProposedMessage
                      contractId={message.text}
                      createdAt={message.createdAt}
                      chatRoomId={room}
                    />
                  )}
                  {messageType === "chat-started" && (
                    <NewChatMessage {...message} status={chatData.status} chatRoomId={room} />
                  )}
                  {messageType === "status-update" && <StatusUpdateMessage {...message} />}

                  {!sameUserAsPrev && messageType === "contract-update" && <ContractStatusMessage {...message} />}

                  {sameUserAsPrev && messageType === "contract-update" && (
                    <ContractStatusMessage {...message} photoURL="no-display" userName="" />
                  )}

                  {messageType === "milestone-proposal" && (
                    <MilestonesProposedMessage
                      contractId={message.text}
                      createdAt={message.createdAt}
                      chatRoomId={room}
                      uid={message.uid}
                    />
                  )}
                </React.Fragment>
              );
            })}
        </Box>

        <>
          {uploadProgress != null && (
            <Stack justifyItems={"center"} alignContent={"center"} alignItems={"center"}>
              <Typography variant="subtitle1" color={"gray"} fontSize={12}>
                Upload in progress...
              </Typography>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{
                  width: "100%",
                }}
              />
            </Stack>
          )}
        </>
        {/* send  */}
        {!loading && chatData?.status === "active" && (
          <CustomPaper messagePaper>
            <Stack direction={"row"} alignItems={"center"} component="form" id="message-form" onSubmit={sendMessage}>
              <Tooltip title="Attach File" enterDelay={600}>
                <Button
                  component="label"
                  sx={{
                    borderRadius: "50%",
                    maxHeight: "45px",
                    maxWidth: "45px",
                    minHeight: "45px",
                    minWidth: "45px",
                  }}
                  disabled={isSendingMessage}
                >
                  <input type="file" hidden onChange={handleFileChange} />
                  <AttachFileIcon />
                </Button>
              </Tooltip>

              <InputBase
                sx={{
                  padding: 1,
                }}
                id="message-input"
                value={newMessage}
                onChange={(event) => setNewMessage(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                disabled={isSendingMessage} // Disable input while sending
                multiline
                fullWidth
                maxRows={4}
              />

              <Divider orientation="vertical" flexItem variant="middle" />
              <Tooltip title="Send Message" enterDelay={600}>
                <IconButton
                  color="primary"
                  sx={{
                    p: "10px",
                  }}
                  aria-label="directions"
                  onClick={sendMessage}
                  disabled={isSendingMessage}
                >
                  <SendIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </CustomPaper>
        )}
      </Box>
    </>
  );
};

export default Chat;
