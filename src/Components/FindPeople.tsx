import { useState, useEffect } from "react";
import { auth, db } from "../Contexts/Session/Firebase.tsx";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Button, Stack, TextField, Typography } from "@mui/material";
import noAvatar from "../assets/noAvatar.webp";
import diacritics from "diacritics";

export const FindPeople = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const usersRef = collection(db, "users");

  useEffect(() => {
    if (searchQuery === "") return;
    const searchQueryNormalized = diacritics.remove(searchQuery);
    const queryUsers = query(
      usersRef,
      where("searchableName", ">=", searchQueryNormalized)
      // where("uid", "!=", auth.currentUser.uid)
    );
    const unsuscribe = onSnapshot(queryUsers, (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setUsers(users);
    });

    return () => unsuscribe();
  }, [searchQuery]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div>
      <div>
        <TextField
          label="Search Users"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div>
        {users.map((user) => (
          <div key={user.id}>
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              <img
                src={user.photoURL || noAvatar}
                alt="users"
                style={{ width: "60px", height: "60px", borderRadius: "50%" }}
              />
              <Typography variant="body1">{user.firstName}</Typography>
              <Button>Add Friend</Button>
            </Stack>
          </div>
        ))}
      </div>
    </div>
  );
};
