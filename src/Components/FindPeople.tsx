import { useState, useEffect } from "react";
import { db } from "../Contexts/Session/Firebase.tsx";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
} from "firebase/firestore";
import { Button, Stack, TextField, Typography } from "@mui/material";
import noAvatar from "../assets/noAvatar.webp";

export const FindPeople = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const messagesRef = collection(db, "users");

  useEffect(() => {
    if (searchQuery === "") return;
    const queryMessages = query(
      messagesRef,
      where("firstName", "==", searchQuery)
    );
    const unsuscribe = onSnapshot(queryMessages, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log(messages);
      setUsers(messages);
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
