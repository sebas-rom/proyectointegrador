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
import {
  auth,
  db,
  getUserInfoFromUid,
} from "../../Contexts/Session/Firebase.tsx";
import { format } from "date-fns";
import messageListSkeleton from "../Messaging/messageListSkeleton.tsx";

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
  const [loadingChatrooms, setloadingChatrooms] = useState(true);

  /**
   * Effect to load chat room details once the component has mounted.
   * It attaches a listener to the user's chat rooms and fetches the latest chat room details.
   */
  useEffect(() => {
    setloadingChatrooms(true);
    const userDocRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnapshot) => {
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
              const [otherUserName, otherPhotoURL] = await getUserInfoFromUid(
                otherUserId
              );
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
                let lastMessageSenderName;
                if (lastMessageSenderUid === auth.currentUser.uid) {
                  lastMessageSenderName = "You:";
                } else {
                  lastMessageSenderName = otherUserName.split(" ")[0] + ":";
                }
                const lastMessageReadArray =
                  messagesSnapshot.docs[0].data().read;

                const lastMessageRead =
                  lastMessageReadArray[auth.currentUser.uid];

                //check if any of the elements inside read is == to auth.currentUser.uid

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
          setloadingChatrooms(false);
        } else {
          console.error("Document does not exist");
          setChatRoomDetails([]);
        }
      },
      (error) => {
        console.error("Error listening to user chatRooms:", error);
      }
    );

    return unsubscribe;
  }, []);

  /**
   * Handles the selection of a chat room.
   * It displays the selected room's chat interface.
   *
   * @param {string} room - The ID of the selected chat room.
   */
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setRoomSelected(true);
    setShowChatList(false);
    //update chatrooms/room/messages/ read field to true for the current user
    // const messagesRef = collection(db, "chatrooms", room, "messages");
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
                        sx={{
                          backgroundColor: detail.lastMessageRead
                            ? "blue"
                            : "red", // Change "initial" to whatever default color you'd like
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
                            <Stack direction={"row"}>
                              <ListItemText primary={detail.otherUserName} />
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
                        {/* replace the name with chatroomdetails of the current selected room */}
                      </Stack>
                    </Stack>
                  </Box>
                  <Divider />
                  {/* Chat */}
                  <Chat room={selectedRoom} />
                </>
              ) : (
                <p>Please select a chat room.</p>
              )}
            </Paper>
          )}
        </Stack>
      </Box>
    </>
  );
}

export default MessagePage;
