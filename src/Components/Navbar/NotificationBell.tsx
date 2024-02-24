import React, { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { db, auth } from "../../Contexts/Session/Firebase.tsx";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const userUid = auth.currentUser.uid; // Get the current user's UID
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const userRef = doc(db, "users", userUid); // Reference to the current user's document in the users collection
    getDoc(userRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const unsubscribeFns = []; // To keep track of unsubscribe functions for clean-up

          userData.chatRooms.forEach((chatRoomId) => {
            console.log("chatRoomId", chatRoomId);
            // Construct the query to only select messages where the read status for the current user is false
            const messagesQuery = query(
              collection(db, "chatrooms", chatRoomId, "messages"),
              where(`read.${userUid}`, "==", false)
            );

            const unsubscribe = onSnapshot(
              messagesQuery,
              (querySnapshot) => {
                const unreadMessages = querySnapshot.docs.map((doc) => ({
                  id: doc.id,
                  ...doc.data(),
                }));
                // Set the notifications for unread messages
                setNotifications((prev) => [
                  ...prev,
                  ...unreadMessages.filter(
                    (message) => !prev.some((m) => m.id === message.id)
                  ),
                ]);
              },
              (error) => {
                console.error("Error fetching unread messages: ", error);
              }
            );

            unsubscribeFns.push(unsubscribe);
          });

          return () => unsubscribeFns.forEach((unsubscribe) => unsubscribe()); // Clean-up on unmount
        } else {
          console.log("User does not exist");
        }
      })
      .catch((error) => console.log("Error getting user document:", error));
  }, [userUid]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={notifications.length} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {notifications.map((notification, index) => (
          <MenuItem key={index} onClick={handleClose}>
            {notification.uid}: {notification.text}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default NotificationBell;
