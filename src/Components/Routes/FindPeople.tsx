import { useState, useEffect } from "react";
import { auth, db } from "../../Contexts/Session/Firebase.tsx";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Button, Stack, TextField, Typography } from "@mui/material";
// import noAvatar from "../assets/noAvatar.webp";
import diacritics from "diacritics";
import ColoredAvatar from "../DataDisplay/ColoredAvatar.tsx";

/**
 * The `FindPeople` component allows users to search and find other users within the application.
 * Users are filtered based on a search query that matches against their first name or last name.
 * The search is case-insensitive and diacritic-insensitive.
 *
 * It uses Firebase Firestore to fetch user data, reactively updating the UI as the search query changes.
 */
const FindPeople = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const usersRef = collection(db, "users");

  /**
   * Effect hook that is invoked whenever the searchQuery state changes.
   * It defines a function to fetch users based on the normalized search query,
   * and sets the fetched users to the state.
   */
  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery === "") {
        setUsers([]);
        return;
      }

      const searchQueryNormalized = diacritics
        .remove(searchQuery)
        .toLowerCase();

      const [querySearchableFirstName, querySearchableLastName] =
        await Promise.all([
          query(
            usersRef,
            where("searchableFirstName", ">=", searchQueryNormalized),
            where("searchableFirstName", "<=", searchQueryNormalized + "\uf8ff")
          ),
          query(
            usersRef,
            where("searchableLastName", ">=", searchQueryNormalized),
            where("searchableLastName", "<=", searchQueryNormalized + "\uf8ff")
          ),
        ]);

      const combinedQuerySnapshot = await Promise.all([
        getDocs(querySearchableFirstName),
        getDocs(querySearchableLastName),
      ]);

      const users = combinedQuerySnapshot.flatMap((querySnapshot) =>
        querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );

      const uniqueUsers = [...new Set(users.map((user) => user.id))]; // Create a Set of unique user IDs
      const uniqueUsersData = uniqueUsers.map((id) =>
        users.find((user) => user.id === id)
      ); // Retrieve complete user data for unique IDs

      setUsers(uniqueUsersData);
    };

    fetchUsers().catch((error) =>
      console.error("Error fetching users:", error)
    );
  }, [searchQuery]);

  /**
   * Handles change event of the search input field and updates the searchQuery state.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event containing the updated value.
   */
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <>
      <TextField
        label="Search Users"
        value={searchQuery}
        onChange={handleSearchChange}
      />

      {users.map((user) => (
        <div key={user.id}>
          {user.uid !== auth.currentUser.uid && (
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              <ColoredAvatar
                userName={user.firstName}
                size="medium"
                photoURL={user.photoURL}
              />

              <Typography variant="body1">{user.firstName}</Typography>
              <Button>Send Message</Button>
            </Stack>
          )}
        </div>
      ))}
    </>
  );
};

export default FindPeople;
