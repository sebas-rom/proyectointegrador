import { useEffect, useState } from "react";
import Chat from "../../Messaging/Chat.tsx";
import {
  List,
  Box,
  Paper,
  ListItemButton,
  Stack,
  Divider,
  Button,
  useMediaQuery,
  Typography,
} from "@mui/material";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar.tsx";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import {
  CONTRACTS_COLLECTION,
  auth,
  db,
  getUserData,
  isFreelancer,
} from "../../../Contexts/Session/Firebase.tsx";
import { format } from "date-fns";
import messageListSkeleton from "../../Messaging/messageListSkeleton.tsx";
import { useParams, useNavigate } from "react-router-dom";
import startChat from "../../../assets/svg/startChat.svg";

/**
 * The MessagePage component is used to render the chat room interface.
 * It allows users to select a chat room and view the messages within.
 * This component also handles mobile screen sizing by adjusting the view.
 */
function MessagePage() {
  const mobile = useMediaQuery("(max-width:900px)");
  const { selectedRoomId } = useParams();
  const navigate = useNavigate();

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomSelected, setRoomSelected] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [chatRoomDetails, setChatRoomDetails] = useState([]);
  const [loadingChatrooms, setLoadingChatrooms] = useState(true);

  useEffect(() => {
    const loadChatRoomDetails = async () => {
      setLoadingChatrooms(true);
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const newChatRoomDetails = [];
            const userChats = docSnapshot.data();
            const chatRooms = userChats.chatRooms || [];

            await Promise.all(
              chatRooms.map(async (chatRoom) => {
                const chatRoomDocRef = doc(db, "chatrooms", chatRoom);
                const chatRoomSnapshot = await getDoc(chatRoomDocRef);

                if (chatRoomSnapshot.exists()) {
                  const otherUserUid = chatRoomSnapshot
                    .data()
                    .members.find((member) => member !== auth.currentUser.uid);
                  const userData = await getUserData(otherUserUid);
                  const otherUserName = `${userData.firstName} ${userData.lastName}`;
                  const otherPhotoURL = userData.photoURL;

                  const messagesRef = collection(
                    db,
                    "chatrooms",
                    chatRoom,
                    "messages"
                  );
                  const queryMessages = query(
                    messagesRef,
                    orderBy("createdAt", "desc"),
                    limit(1)
                  );
                  const messagesSnapshot = await getDocs(queryMessages);

                  if (!messagesSnapshot.empty) {
                    const lastMessageData = messagesSnapshot.docs[0].data();
                    const lastMessage = lastMessageData.text;
                    const lastMessageTime = lastMessageData.createdAt;
                    const lastMessageSenderUid = lastMessageData.uid;
                    const lastMessageSenderName =
                      lastMessageSenderUid === auth.currentUser.uid
                        ? "You:"
                        : `${otherUserName.split(" ")[0]}:`;
                    const lastMessageRead =
                      lastMessageData.read?.[auth.currentUser.uid];

                    newChatRoomDetails.push({
                      chatRoom,
                      otherUserUid,
                      otherUserName,
                      otherPhotoURL,
                      lastMessage,
                      lastMessageTime,
                      lastMessageSenderName,
                      lastMessageRead,
                    });
                  }

                  const unsubscribeMessages = onSnapshot(
                    messagesRef,
                    async (docSnapshot) => {
                      if (!docSnapshot.empty) {
                        const messagesSnapshot = await getDocs(queryMessages);
                        if (!messagesSnapshot.empty) {
                          const lastMessageData =
                            messagesSnapshot.docs[0].data();
                          const lastMessage = lastMessageData.text;
                          const lastMessageTime = lastMessageData.createdAt;
                          const lastMessageSenderUid = lastMessageData.uid;
                          const lastMessageSenderName =
                            lastMessageSenderUid === auth.currentUser.uid
                              ? "You:"
                              : `${otherUserName.split(" ")[0]}:`;
                          let lastMessageRead;
                          if (auth.currentUser.uid === lastMessageSenderUid) {
                            lastMessageRead = true;
                          } else {
                            lastMessageRead =
                              lastMessageData.read?.[auth.currentUser.uid] ||
                              false;
                          }

                          const existingRoomIndex =
                            newChatRoomDetails.findIndex(
                              (room) => room.chatRoom === chatRoom
                            );
                          if (existingRoomIndex !== -1) {
                            newChatRoomDetails[existingRoomIndex] = {
                              chatRoom,
                              otherUserUid,
                              otherUserName,
                              otherPhotoURL,
                              lastMessage,
                              lastMessageTime,
                              lastMessageSenderName,
                              lastMessageRead,
                            };
                          } else {
                            newChatRoomDetails.push({
                              chatRoom,
                              otherUserUid,
                              otherUserName,
                              otherPhotoURL,
                              lastMessage,
                              lastMessageTime,
                              lastMessageSenderName,
                              lastMessageRead,
                            });
                          }

                          setChatRoomDetails([...newChatRoomDetails]);
                        }
                      }
                    }
                  );
                  return unsubscribeMessages;
                }
              })
            );

            newChatRoomDetails.sort(
              (a, b) => b.lastMessageTime - a.lastMessageTime
            );
            setChatRoomDetails(newChatRoomDetails);
            setLoadingChatrooms(false);

            if (selectedRoomId) {
              setSelectedRoom(selectedRoomId);
              setRoomSelected(true);
              setShowChatList(false);
            }
          } else {
            console.error("Document does not exist");
            setChatRoomDetails([]);
          }
        });

        return unsubscribeUser;
      } catch (error) {
        console.error("Error listening to user chatRooms:", error);
      }
    };

    loadChatRoomDetails();
  }, []);

  const handleRoomSelect = async (room) => {
    setSelectedRoom(room);
    setRoomSelected(true);
    setShowChatList(false);
    navigate(`/messages/${room}`);
  };

  //IMPROVE DELETE DUPLICATES
  const handleClickProposeContract = async () => {
    const newDocRef = collection(db, CONTRACTS_COLLECTION);
    try {
      const isCurrentUserFreelancer = isFreelancer(auth.currentUser.uid);
      let freelancerUid;
      let clientUid;
      if (isCurrentUserFreelancer) {
        freelancerUid = auth.currentUser.uid;
        for (let i = 0; i < chatRoomDetails.length; i++) {
          if (chatRoomDetails[i].chatRoom === selectedRoom) {
            clientUid = chatRoomDetails[i].otherUserUid;
            break;
          }
        }
      } else {
        clientUid = auth.currentUser.uid;
        for (let i = 0; i < chatRoomDetails.length; i++) {
          if (chatRoomDetails[i].chatRoom === selectedRoom) {
            freelancerUid = chatRoomDetails[i].otherUserUid;
            break;
          }
        }
      }
      const docSnap = await addDoc(newDocRef, {
        freelancerUid: freelancerUid,
        clientUid: clientUid,
        proposedBy: auth.currentUser.uid,
        chatRoomId: selectedRoom,
      });
      navigate(`/propose-contract/${docSnap.id}`);
    } catch (error) {
      console.error("Error reserving contract ID:", error);
      // Handle errors appropriately, e.g., display an error message to the user
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          height: "91vh",
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          width={"100%"}
          sx={{ padding: "10px" }}
        >
          {/* Chat List */}
          {(showChatList || !mobile) && (
            <Paper
              sx={{
                width: !mobile ? "25%" : "100%",
                height: "100%",
                overflow: "auto",
              }}
            >
              <Typography variant="h4" textAlign={"center"} padding={2}>
                Messages List
              </Typography>
              <Divider />
              <Paper
                sx={{ maxHeight: "calc(100% - 48px)", overflow: "auto" }}
                elevation={0}
              >
                {loadingChatrooms && messageListSkeleton()}
                <List>
                  {chatRoomDetails.length == 0 && (
                    <>
                      <Typography variant="h6" textAlign={"center"} padding={2}>
                        You have no messages yet.
                      </Typography>
                      <Typography textAlign={"center"} padding={2}>
                        It's the perfect time to start conecting.
                      </Typography>
                    </>
                  )}
                  {chatRoomDetails.map((detail) => (
                    <div key={detail.chatRoom}>
                      <ListItemButton
                        onClick={() => handleRoomSelect(detail.chatRoom)}
                        selected={selectedRoom === detail.chatRoom}
                        sx={{
                          borderRadius: "5px",
                          margin: "5px",
                          backgroundColor: !detail.lastMessageRead
                            ? "#dddddd"
                            : "",
                        }}
                      >
                        <Stack
                          direction={"row"}
                          spacing={2}
                          height={"100%"}
                          width={"100%"}
                          justifyContent="flex-start"
                          alignItems="center"
                        >
                          <ColoredAvatar
                            userName={detail.otherUserName}
                            size="medium"
                            photoURL={detail.otherPhotoURL}
                          />
                          <Stack flexGrow={1}>
                            <Stack
                              direction={"row"}
                              justifyContent="space-between"
                            >
                              <Typography
                                variant="body1"
                                sx={{
                                  fontWeight: !detail.lastMessageRead
                                    ? "bold"
                                    : "normal",
                                  fontSize: !detail.lastMessageRead
                                    ? "1rem"
                                    : "inherit",
                                }}
                              >
                                {detail.otherUserName}
                              </Typography>
                              {detail.lastMessageTime && (
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  sx={{
                                    fontWeight: !detail.lastMessageRead
                                      ? "bold"
                                      : "normal",
                                    fontSize: !detail.lastMessageRead
                                      ? "1rem"
                                      : "inherit",
                                  }}
                                >
                                  {format(
                                    new Date(
                                      detail.lastMessageTime.seconds * 1000
                                    ),
                                    "h:mm a"
                                  )}
                                </Typography>
                              )}
                            </Stack>
                            <Box
                              sx={{
                                height: "40px",
                                width: "100%",
                                overflow: "hidden",
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="textSecondary"
                                textOverflow={"ellipsis"}
                                overflow={"hidden"}
                              >
                                {detail.lastMessageSenderName +
                                  " " +
                                  detail.lastMessage}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </ListItemButton>
                      <Divider />
                    </div>
                  ))}
                </List>
              </Paper>
            </Paper>
          )}
          {/* Chat */}
          {(!mobile || !showChatList) && (
            <Paper sx={{ width: mobile ? "100%" : "75%" }} elevation={3}>
              {roomSelected ? (
                <>
                  {/* Chat Header*/}
                  <Box sx={{ position: "relative", width: "100%" }}>
                    <Stack
                      height={"100%"}
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                      sx={{ padding: 1 }}
                    >
                      {mobile && (
                        <Button
                          sx={{ height: "100%" }}
                          onClick={() => {
                            setShowChatList(true);
                          }}
                        >
                          <ArrowBackIcon />
                        </Button>
                      )}
                      <Stack direction={"row"} spacing={2} alignItems="center">
                        <ColoredAvatar
                          userName={
                            chatRoomDetails.find(
                              (room) => room.chatRoom === selectedRoom
                            )?.otherUserName
                          }
                          size="medium"
                          photoURL={
                            chatRoomDetails.find(
                              (room) => room.chatRoom === selectedRoom
                            )?.otherPhotoURL
                          }
                        />
                        <Typography variant="h5">
                          {
                            chatRoomDetails.find(
                              (room) => room.chatRoom === selectedRoom
                            )?.otherUserName
                          }
                        </Typography>
                      </Stack>
                    </Stack>

                    <Divider />
                    <Stack direction={"row"} justifyContent={"flex-end"}>
                      <Button onClick={() => handleClickProposeContract()}>
                        Propose Contract
                      </Button>
                      <Button>View Contract</Button>
                      <Button>Schedule A Call</Button>
                    </Stack>
                    <Divider />
                  </Box>

                  {/* Chat */}
                  <Chat room={selectedRoom} />
                </>
              ) : (
                <Stack
                  direction="column"
                  justifyContent="space-evenly"
                  alignItems="center"
                  sx={{ height: "100%" }}
                >
                  <img
                    src={startChat}
                    alt="messagePageWelcome"
                    style={{
                      maxHeight: "100%",
                    }}
                  ></img>
                </Stack>
              )}
            </Paper>
          )}
        </Stack>
      </Box>
    </>
  );
}

export default MessagePage;
