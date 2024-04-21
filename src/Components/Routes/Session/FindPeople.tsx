import { useState, useEffect } from "react";
import { USERS_COLLECTION, UserData, auth, db } from "../../../Contexts/Session/Firebase.tsx";
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  Button,
  Container,
  IconButton,
  InputBase,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material";
import diacritics from "diacritics";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar.tsx";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import React from "react";
import CustomPaper from "../../DataDisplay/CustomPaper.tsx";
import CustomContainer from "../../DataDisplay/CustomContainer.tsx";
import { VIEW_PROFILE_PATH } from "../routes.tsx";
import SendMessageToDialog from "../../FindPeople/SendMessageToDialog.tsx";

/**
 * FindPeople component allows users to search for other users and send them messages.
 * @returns {JSX.Element} - The FindPeople component UI.
 * @component
 */
const FindPeople = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // New state to track the selected user for messaging

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery === "") {
        setUsers([]);
        return;
      }

      const searchQueryNormalized = diacritics.remove(searchQuery).toLowerCase();

      const usersCollectionRef = collection(db, USERS_COLLECTION);

      const [firstNameQuerySnapshot, lastNameQuerySnapshot] = await Promise.all([
        getDocs(
          query(
            usersCollectionRef,
            where("searchableFirstName", ">=", searchQueryNormalized),
            where("searchableFirstName", "<=", searchQueryNormalized + "\uf8ff")
          )
        ),
        getDocs(
          query(
            usersCollectionRef,
            where("searchableLastName", ">=", searchQueryNormalized),
            where("searchableLastName", "<=", searchQueryNormalized + "\uf8ff")
          )
        ),
      ]);

      const usersData = [
        ...firstNameQuerySnapshot.docs.map((doc) => ({
          ...(doc.data() as UserData),
          id: doc.id,
        })),
        ...lastNameQuerySnapshot.docs.map((doc) => ({
          ...(doc.data() as UserData),
          id: doc.id,
        })),
      ];

      const uniqueUsers = Array.from(new Set(usersData.map((user) => user.id)));
      const uniqueUsersData = uniqueUsers.map((id) => usersData.find((user) => user.id === id));

      setUsers(uniqueUsersData);
    };

    fetchUsers().catch((error) => console.error("Error fetching users:", error));
  }, [searchQuery]);

  /**
   * Handles the change in the search input field.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event object.
   */
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  /**
   * Opens the message dialog and sets the selected user.
   * @param {Object} user - The selected user object.
   */
  const handleOpenMessageDialog = (user) => {
    setSelectedUser(user); // Set the selected user when opening the message dialog
    setOpenMessageDialog(true);
  };

  return (
    <>
      <CustomContainer>
        <Container
          sx={{
            height: {
              xs: "calc(100vh - 134px)",
              sm: "calc(100vh - 144px)",
            },
            display: "flex",
            flexDirection: "column",
          }}
          disableGutters
        >
          <CustomPaper
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
            messagePaper
          >
            <InputBase
              sx={{
                ml: 1,
                flex: 1,
              }}
              placeholder="Search Users"
              value={searchQuery}
              onChange={handleSearchChange}
              inputProps={{
                "aria-label": "search google maps",
              }}
            />
            <IconButton
              type="button"
              sx={{
                p: "10px",
              }}
              aria-label="search"
            >
              <SearchIcon />
            </IconButton>
          </CustomPaper>

          <Stack
            spacing={2}
            sx={{
              width: "100%",
              height: "100%",
              flex: 1,
            }}
            alignContent={"center"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <div />
            <CustomPaper
              sx={{
                alignItems: "center",
                width: "100%",
                height: "100%",
              }}
              messagePaper
            >
              <TableContainer
                sx={{
                  height: "100%",
                }}
              >
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
                      <React.Fragment key={user.uid}>
                        {user.uid !== auth.currentUser.uid && (
                          <TableRow>
                            <TableCell component="th" scope="row">
                              <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                <ColoredAvatar
                                  userName={user.firstName + " " + user.lastName}
                                  size="medium"
                                  photoURL={user.photoThumbURL || user.photoURL}
                                />
                                <Typography variant="body1" sx={{ ":hover": { textDecoration: "underline" } }}>
                                  <Link
                                    to={`/${VIEW_PROFILE_PATH}/${user.uid}`}
                                    style={{
                                      textDecoration: "none",
                                      color: "inherit",
                                    }}
                                  >
                                    {user.firstName + " " + user.lastName}
                                  </Link>
                                </Typography>
                              </Stack>
                            </TableCell>

                            <TableCell width={"20%"}>
                              <Button onClick={() => handleOpenMessageDialog(user)}>Send Message</Button>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CustomPaper>
          </Stack>
        </Container>
      </CustomContainer>
      <SendMessageToDialog
        open={openMessageDialog}
        handleClose={() => setOpenMessageDialog(false)}
        user={selectedUser}
      />
    </>
  );
};

export default FindPeople;
