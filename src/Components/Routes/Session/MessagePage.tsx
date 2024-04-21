import { useEffect, useState } from "react";
import Chat from "../../Messaging/Chat.tsx";
import { List, Box, Stack, Button, useMediaQuery, Typography, Tooltip } from "@mui/material";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar.tsx";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import {
  CHATROOM_COLLECTION,
  MESSAGES_COLLECTION,
  USERS_COLLECTION,
  auth,
  db,
  getUserData,
} from "../../../Contexts/Session/Firebase.tsx";
import messageListSkeleton from "../../Messaging/messageListSkeleton.tsx";
import { useParams, useNavigate, Link } from "react-router-dom";
import startChat from "../../../assets/svg/startChat.svg";
import ChatListItem from "../../Messaging/ChatListItem.tsx";
import CustomPaper from "../../DataDisplay/CustomPaper.tsx";
import { MESSAGES_PATH, VIEW_PROFILE_PATH } from "../routes.tsx";
/**
 * The MessagePage component is used to render the chat room interface.
 * It allows users to select a chat room and view the messages within.
 * This component also handles mobile screen sizing by adjusting the view.
 * @returns {JSX.Element} - The MessagePage component UI.
 * @component
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
        const userDocRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, async (docSnapshot) => {
          if (docSnapshot.exists()) {
            const newChatRoomDetails = [];
            const userChats = docSnapshot.data();
            const chatRooms = userChats.chatRooms || [];

            await Promise.all(
              chatRooms.map(async (chatRoom) => {
                const chatRoomDocRef = doc(db, CHATROOM_COLLECTION, chatRoom);
                const chatRoomSnapshot = await getDoc(chatRoomDocRef);

                if (chatRoomSnapshot.exists()) {
                  const otherUserUid = chatRoomSnapshot
                    .data()
                    .members.find((member) => member !== auth.currentUser.uid);
                  const userData = await getUserData(otherUserUid);
                  const otherUserName = `${userData.firstName} ${userData.lastName}`;
                  const otherPhotoURL = userData.photoThumbURL || userData.photoURL;

                  const messagesRef = collection(db, CHATROOM_COLLECTION, chatRoom, MESSAGES_COLLECTION);
                  const queryMessages = query(messagesRef, orderBy("createdAt", "desc"), limit(1));
                  const messagesSnapshot = await getDocs(queryMessages);

                  if (!messagesSnapshot.empty) {
                    const lastMessageData = messagesSnapshot.docs[0].data();
                    const lastMessage = lastMessageData.text;
                    const lastMessageTime = lastMessageData.createdAt;
                    const lastMessageSenderUid = lastMessageData.uid;
                    const lastMessageSenderName =
                      lastMessageSenderUid === auth.currentUser.uid ? "You:" : `${otherUserName.split(" ")[0]}:`;
                    const lastMessageRead = lastMessageData.read?.[auth.currentUser.uid];

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

                  const unsubscribeMessages = onSnapshot(messagesRef, async (docSnapshot) => {
                    if (!docSnapshot.empty) {
                      const messagesSnapshot = await getDocs(queryMessages);
                      if (!messagesSnapshot.empty) {
                        const lastMessageData = messagesSnapshot.docs[0].data();
                        const lastMessageType = lastMessageData.type || "text";
                        const lastMessage = lastMessageData.text;
                        const lastMessageTime = lastMessageData.createdAt;
                        const lastMessageSenderUid = lastMessageData.uid;
                        const lastMessageSenderName =
                          lastMessageSenderUid === auth.currentUser.uid ? "You:" : `${otherUserName.split(" ")[0]}:`;
                        let lastMessageRead;
                        if (auth.currentUser.uid === lastMessageSenderUid) {
                          lastMessageRead = true;
                        } else {
                          lastMessageRead = lastMessageData.read?.[auth.currentUser.uid] || false;
                        }

                        const existingRoomIndex = newChatRoomDetails.findIndex((room) => room.chatRoom === chatRoom);
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
                            lastMessageType,
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
                            lastMessageType,
                          });
                        }

                        setChatRoomDetails([...newChatRoomDetails]);
                      }
                    }
                  });
                  return unsubscribeMessages;
                }
              })
            );

            newChatRoomDetails.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
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
    //Avoid rerendering the component on missing dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoomSelect = async (room) => {
    setSelectedRoom(room);
    setRoomSelected(true);
    setShowChatList(false);
    navigate(`/${MESSAGES_PATH}/${room}`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: {
          xs: "calc(100vh - 54px)",
          sm: "calc(100vh - 64px)",
        },
      }}
    >
      <Stack
        direction="row"
        spacing={"10px"}
        width={"100%"}
        sx={{
          padding: "10px",
        }}
      >
        {/* Chat List */}
        {(showChatList || !mobile) && (
          <CustomPaper
            sx={{
              width: !mobile ? "25%" : "100%",
              height: "100%",
              overflow: "auto",
            }}
          >
            <Typography variant="h4" textAlign={"center"} padding={2}>
              Messages
            </Typography>

            <CustomPaper
              sx={{
                maxHeight: "calc(100% - 48px)",
                overflow: "auto",
              }}
            >
              {loadingChatrooms && messageListSkeleton()}
              <List>
                {chatRoomDetails.length == 0 && (
                  <>
                    <Typography variant="h6" textAlign={"center"} padding={2}>
                      You have no messages yet.
                    </Typography>
                    <Typography textAlign={"center"} padding={2}>
                      It's the perfect time to start connecting.
                    </Typography>
                  </>
                )}
                {chatRoomDetails.map((detail) => (
                  <ChatListItem
                    key={detail.chatRoom}
                    detail={detail}
                    selectedRoom={selectedRoom}
                    handleRoomSelect={handleRoomSelect}
                  />
                ))}
              </List>
            </CustomPaper>
          </CustomPaper>
        )}
        {/* Chat */}
        {(!mobile || !showChatList) && (
          <CustomPaper
            sx={{
              width: mobile ? "100%" : "75%",
            }}
          >
            {roomSelected ? (
              <>
                {/* Chat Header*/}
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <Stack
                    height={"100%"}
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                    sx={{
                      padding: 1,
                    }}
                  >
                    {mobile && (
                      <Button
                        sx={{
                          height: "100%",
                        }}
                        onClick={() => {
                          setShowChatList(true);
                        }}
                      >
                        <ArrowBackIcon />
                      </Button>
                    )}
                    <Stack direction={"row"} spacing={2} alignItems="center">
                      <ColoredAvatar
                        userName={chatRoomDetails.find((room) => room.chatRoom === selectedRoom)?.otherUserName}
                        size="medium"
                        photoURL={chatRoomDetails.find((room) => room.chatRoom === selectedRoom)?.otherPhotoURL}
                      />
                      <Tooltip title="View Profile">
                        <Typography variant="h5" color={"inherit"} sx={{ ":hover": { textDecoration: "underline" } }}>
                          <Link
                            to={`/${VIEW_PROFILE_PATH}/${
                              chatRoomDetails.find((room) => room.chatRoom === selectedRoom)?.otherUserUid
                            }`}
                            style={{
                              textDecoration: "none",
                              color: "inherit",
                            }}
                          >
                            {chatRoomDetails.find((room) => room.chatRoom === selectedRoom)?.otherUserName}
                          </Link>
                        </Typography>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>

                {/* Chat */}
                <Chat room={selectedRoom} />
              </>
            ) : (
              <Stack
                direction="column"
                justifyContent="space-evenly"
                alignItems="center"
                sx={{
                  height: "100%",
                }}
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
          </CustomPaper>
        )}
      </Stack>
    </Box>
  );
}

export default MessagePage;
