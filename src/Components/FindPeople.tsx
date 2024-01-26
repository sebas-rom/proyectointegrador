import { useState, useEffect } from "react";
import { auth, db } from "../Contexts/Session/Firebase.tsx";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Button, Stack, TextField, Typography } from "@mui/material";
import noAvatar from "../assets/noAvatar.webp";
import diacritics from "diacritics";

export const FindPeople = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const usersRef = collection(db, "users");

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
              <img
                src={user.photoURL || noAvatar}
                alt="users"
                style={{ width: "60px", height: "60px", borderRadius: "50%" }}
              />
              <Typography variant="body1">{user.firstName}</Typography>
              <Button>Add Friend</Button>
            </Stack>
          )}
        </div>
      ))}
    </>
  );
};
