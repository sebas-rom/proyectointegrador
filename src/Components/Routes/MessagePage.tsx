import { useEffect, useState } from "react";
import Chat from "../MainChat/Chat.tsx";
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
import { doc, onSnapshot } from "firebase/firestore";
import {
  auth,
  db,
  getUserInfoFromUid,
} from "../../Contexts/Session/Firebase.tsx";

//
//
// no-Docs-yet
//
//
function MessagePage() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomSelected, setRoomSelected] = useState(false);

  const mobile = useMediaQuery("(max-width:900px)");
  const [showChatList, setShowChatList] = useState(true);
  const [chatRooms, setChatRooms] = useState([]); // Initialize chatRooms as an empty array
  const [otherUserInfos, setOtherUserInfos] = useState({}); // State for all other user info

  useEffect(() => {
    // Create a reference to the current user's document
    const userDocRef = doc(db, "users", auth.currentUser.uid);

    // Set up a real-time listener for the user's chatRooms
    const unsubscribe = onSnapshot(
      userDocRef,
      async (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userChats = docSnapshot.data();
          setChatRooms(userChats.chatRooms || []); // Update local state with fetched chatRooms
          // Fetch the other user's info for each chatRoom
          // for each chatRoom, fetch the members array and get the other user's UID
        } else {
          console.error("Document does not exist");
          setChatRooms([]);
        }
      },
      (error) => {
        console.error("Error listening to user chatRooms:", error);
      }
    );

    // Clean up the listener when the component unmounts
    return unsubscribe;
  }, []);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setRoomSelected(true);
    setShowChatList(false);
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          height: "91vh", // This will make the container take the full viewport height
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
              <Paper
                sx={{
                  maxHeight: "calc(100% - 48px)", // Adjust this value as needed for the header
                  overflow: "auto",
                }}
              >
                <List>
                  {chatRooms.map((room) => (
                    <div key={room}>
                      <ListItemButton
                        onClick={() => handleRoomSelect(room)}
                        selected={selectedRoom === room}
                        sx={{ borderRadius: 3, margin: 1 }}
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
                            userName="Sebas Romero"
                            size="medium"
                          />
                          <Stack width={"100%"}>
                            <Stack direction={"row"}>
                              <ListItemText primary={`Chat with ${room}`} />
                              <Typography variant="body2" color="textSecondary">
                                9:42AM
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
                                The last message with sebas romero was this one
                                The last message with sebas romero was this one
                                The last message with sebas romero was this one
                                The last message with sebas romero was this one
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </ListItemButton>
                      {/* <Divider orientation="horizontal" /> */}
                    </div>
                  ))}
                </List>
              </Paper>
            </Paper>
          )}

          {/* Chat  */}
          {(!mobile || !showChatList) && (
            <Paper
              sx={{
                width: mobile ? "100%" : "75%",
                // maxWidth: "80%",
              }}
              elevation={3}
            >
              {roomSelected ? (
                <>
                  {/* Chat Header*/}
                  <Box
                    sx={{
                      position: "relative",
                      height: "15%",
                      width: "100%",
                    }}
                  >
                    <Stack
                      height={"100%"}
                      direction="row"
                      justifyContent="flex-start"
                      alignItems="center"
                      // spacing={2}
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
                        <ColoredAvatar userName="Sebas Romero" size="medium" />
                        <Typography variant="h5">Sebastián Romero</Typography>
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
