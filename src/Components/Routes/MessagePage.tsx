import { useEffect, useState } from "react";
import Chat from "../Messaging/Chat.tsx";
import {
  List,
  ListItemText,
  Box,
  Paper,
  ListItemButton,
  Stack,
  Divider,
  Button,
  useMediaQuery,
  Typography,
} from "@mui/material";
import ColoredAvatar from "../DataDisplay/ColoredAvatar.tsx";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db, getUserData } from "../../Contexts/Session/Firebase.tsx";
import { format } from "date-fns";
import messageListSkeleton from "../Messaging/messageListSkeleton.tsx";
import { useParams, useNavigate } from "react-router-dom";

/**
 * The MessagePage component is used to render the chat room interface.
 * It allows users to select a chat room and view the messages within.
 * This component also handles mobile screen sizing by adjusting the view.
 */
function MessagePage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomSelected, setRoomSelected] = useState(false);
  const mobile = useMediaQuery("(max-width:900px)");
  const [showChatList, setShowChatList] = useState(true);
  const [chatRoomDetails, setChatRoomDetails] = useState([]);
  const [loadingChatrooms, setLoadingChatrooms] = useState(true);

  // Retrieve selectedRoomId from URL params
  const { selectedRoomId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const loadChatRoomDetails = async () => {
      setLoadingChatrooms(true);
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const unsubscribe = onSnapshot(userDocRef, async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const newChatRoomDetails = [];
            const userChats = docSnapshot.data();
            const chatRooms = userChats.chatRooms || [];
            const promises = chatRooms.map(async (chatRoom) => {
              const chatRoomDocRef = doc(db, "chatrooms", chatRoom);
              const chatRoomSnapshot = await getDoc(chatRoomDocRef);
              if (chatRoomSnapshot.exists()) {
                const otherUserId = chatRoomSnapshot
                  .data()
                  .members.find((member) => member !== auth.currentUser.uid);
                const userData = await getUserData(otherUserId);
                const otherUserName =
                  userData.firstName + " " + userData.lastName;
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
                  const lastMessage = messagesSnapshot.docs[0].data().text;
                  const lastMessageTime =
                    messagesSnapshot.docs[0].data().createdAt;
                  const lastMessageSenderUid =
                    messagesSnapshot.docs[0].data().uid;
                  const lastMessageSenderName =
                    lastMessageSenderUid === auth.currentUser.uid
                      ? "You:"
                      : otherUserName.split(" ")[0] + ":";
                  const lastMessageReadArray =
                    messagesSnapshot.docs[0].data().read;
                  const lastMessageRead =
                    lastMessageReadArray[auth.currentUser.uid];

                  newChatRoomDetails.push({
                    chatRoom,
                    otherUserName,
                    otherPhotoURL,
                    lastMessage,
                    lastMessageTime,
                    lastMessageSenderName,
                    lastMessageRead,
                  });
                }
              }
            });
            await Promise.all(promises);
            setChatRoomDetails(newChatRoomDetails);
            setLoadingChatrooms(false);

            // Set selected room based on selectedRoomId after data is fetched
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

        return unsubscribe;
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
                  {chatRoomDetails.map((detail) => (
                    <div key={detail.chatRoom}>
                      <ListItemButton
                        onClick={() => handleRoomSelect(detail.chatRoom)}
                        selected={selectedRoom === detail.chatRoom}
                        // sx={{
                        //   backgroundColor: detail.lastMessageRead
                        //     ? "blue"
                        //     : "red",
                        // }}
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
                            <Stack direction={"row"}>
                              <ListItemText
                                primary={detail.otherUserName}
                                // sx={{
                                //   fontWeight: detail.lastMessageRead
                                //     ? "bold"
                                //     : "normal",
                                // }}
                              />
                              <Typography variant="body2" color="textSecondary">
                                {format(
                                  new Date(
                                    detail.lastMessageTime.seconds * 1000
                                  ),
                                  "h:mm a"
                                )}
                              </Typography>
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
                  <Box
                    sx={{ position: "relative", height: "15%", width: "100%" }}
                  >
                    <Stack
                      height={"100%"}
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
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
                      <Stack
                        direction={"row"}
                        sx={{ marginLeft: 2, height: "100%" }}
                        spacing={2}
                        alignItems="center"
                      >
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
                  </Box>
                  <Divider />
                  {/* Chat */}
                  <Chat room={selectedRoom} />
                </>
              ) : (
                <Typography variant="body1">
                  Please select a chat room.
                </Typography>
              )}
            </Paper>
          )}
        </Stack>
      </Box>
    </>
  );
}

export default MessagePage;
