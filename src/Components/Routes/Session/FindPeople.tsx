import { useState, useEffect } from "react";
import {
  auth,
  createNewChat,
  db,
  sendMessageToChat,
} from "../../../Contexts/Session/Firebase.tsx";
import { collection, getDocs, query, where } from "firebase/firestore";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import diacritics from "diacritics";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar.tsx";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import React from "react";
import { useFeedback } from "../../../Contexts/Feedback/FeedbackContext.tsx";

const FindPeople = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // New state to track the selected user for messaging
  const usersCollectionRef = collection(db, "users");
  const [chatAlreadyExists, setChatAlreadyExists] = useState(false);
  const [alreadyExistsChatId, setAlreadyExistsChatId] = useState(null);
  const navigate = useNavigate();

  const { setLoading } = useFeedback();
  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery === "") {
        setUsers([]);
        return;
      }

      const searchQueryNormalized = diacritics
        .remove(searchQuery)
        .toLowerCase();

      const [firstNameQuerySnapshot, lastNameQuerySnapshot] = await Promise.all(
        [
          getDocs(
            query(
              usersCollectionRef,
              where("searchableFirstName", ">=", searchQueryNormalized),
              where(
                "searchableFirstName",
                "<=",
                searchQueryNormalized + "\uf8ff"
              )
            )
          ),
          getDocs(
            query(
              usersCollectionRef,
              where("searchableLastName", ">=", searchQueryNormalized),
              where(
                "searchableLastName",
                "<=",
                searchQueryNormalized + "\uf8ff"
              )
            )
          ),
        ]
      );

      const usersData = [
        ...firstNameQuerySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })),
        ...lastNameQuerySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })),
      ];

      const uniqueUsers = Array.from(new Set(usersData.map((user) => user.id)));
      const uniqueUsersData = uniqueUsers.map((id) =>
        usersData.find((user) => user.id === id)
      );

      setUsers(uniqueUsersData);
    };

    fetchUsers().catch((error) =>
      console.error("Error fetching users:", error)
    );
  }, [searchQuery]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleOpenMessageDialog = (user) => {
    setSelectedUser(user); // Set the selected user when opening the message dialog
    setOpen(true);
  };

  const handleCloseMessageDialog = () => {
    setOpen(false);
  };

  const sendMessage = async () => {
    try {
      setLoading(true);
      const newChatRoom = await createNewChat(selectedUser.id);
      const newChatRoomId = newChatRoom[0];
      const isNewChatRoomNew = newChatRoom[1];
      if (isNewChatRoomNew) {
        await sendMessageToChat(newChatRoomId, message, "chat-started");
        handleCloseMessageDialog();
        navigate(`/messages/${newChatRoomId}`);
      } else {
        setChatAlreadyExists(true);
        setAlreadyExistsChatId(newChatRoomId);
      }
    } catch (error) {
      console.error("Error setting loading state:", error);
    } finally {
      setLoading(false);
    }
  };

  const goToChatAlreadyExists = () => {
    navigate(`/messages/${alreadyExistsChatId}`);
  };
  return (
    <>
      <Container
        maxWidth={"md"}
        sx={{
          height: "85vh",
          marginTop: 1,
          marginBottom: 1,
        }}
      >
        <Stack
          spacing={2}
          sx={{ width: "100%", height: "15%" }}
          alignContent={"center"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <div />

          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
          >
            <InputBase
              sx={{ ml: 1, flex: 1 }}
              placeholder="Search Users"
              value={searchQuery}
              onChange={handleSearchChange}
              inputProps={{ "aria-label": "search google maps" }}
            />
            <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
              <SearchIcon />
            </IconButton>
          </Paper>

          <div />
        </Stack>
        <Stack
          spacing={2}
          sx={{ width: "100%", height: "85%" }}
          alignContent={"center"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Paper
            component="form"
            sx={{
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <TableContainer sx={{ height: "100%" }}>
              <Table stickyHeader aria-label="sticky table">
                {/* <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Contact</TableCell>
                  </TableRow>
                </TableHead> */}
                <TableBody>
                  {users.map((user) => (
                    <React.Fragment key={user.id}>
                      {user.uid !== auth.currentUser.uid && (
                        <TableRow>
                          <TableCell component="th" scope="row">
                            <Stack
                              direction={"row"}
                              spacing={1}
                              alignItems={"center"}
                            >
                              <ColoredAvatar
                                userName={user.firstName + " " + user.lastName}
                                size="medium"
                                photoURL={user.photoThumbURL || user.photoURL}
                              />
                              <Typography variant="body1">
                                {user.firstName + " " + user.lastName}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell width={"20%"}>
                            <Button
                              onClick={() => handleOpenMessageDialog(user)}
                            >
                              Send Message
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
          <div />
        </Stack>
      </Container>
      <Dialog
        open={open}
        onClose={handleCloseMessageDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Send a Message request to{" "}
          {selectedUser && selectedUser.firstName + " " + selectedUser.lastName}
        </DialogTitle>
        <DialogContent>
          <TextField
            id="outlined-multiline-static"
            multiline
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
          />
        </DialogContent>

        {chatAlreadyExists && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            You Already have a chat with this user
            <Button
              variant="contained"
              sx={{ marginLeft: 2 }}
              onClick={goToChatAlreadyExists}
            >
              Go to chat
            </Button>
          </Alert>
        )}

        {!chatAlreadyExists && (
          <DialogActions>
            <Button onClick={handleCloseMessageDialog}>Cancel</Button>
            <Button onClick={sendMessage}>Send Message</Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
};

export default FindPeople;
