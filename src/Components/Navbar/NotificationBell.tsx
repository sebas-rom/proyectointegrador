import React, { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { db, auth, getUserData } from "../../Contexts/Session/Firebase.tsx";
import {
  collection,
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
    const userRef = doc(db, "users", userUid);
    getDoc(userRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const unsubscribeFns = []; // To keep track of unsubscribe functions for clean-up

          userData.chatRooms.forEach((chatRoomId) => {
            const messagesQuery = query(
              collection(db, "chatrooms", chatRoomId, "messages"),
              where(`read.${userUid}`, "==", false)
            );

            const unsubscribe = onSnapshot(
              messagesQuery,
              async (querySnapshot) => {
                const unreadMessagesPromises = querySnapshot.docs.map(
                  async (doc) => {
                    const messageData = doc.data();
                    try {
                      const userData = await getUserData(messageData.uid);
                      const userName =
                        userData.firstName + " " + userData.lastName;

                      return {
                        id: doc.id,
                        senderName: userName, // Now storing the sender's name instead of UID
                        ...messageData,
                      };
                    } catch (error) {
                      console.error("Error fetching user name:", error);
                      // Handle the error appropriately - you might choose to ignore this message or display a placeholder name
                      return {
                        id: doc.id,
                        senderName: "Unknown",
                        ...messageData,
                      };
                    }
                  }
                );

                const unreadMessages = await Promise.all(
                  unreadMessagesPromises
                );

                // Set the notifications for unread messages
                setNotifications((prev) => {
                  const newNotifications = unreadMessages.filter(
                    (newMessage) =>
                      !prev.some(
                        (prevMessage) => prevMessage.id === newMessage.id
                      )
                  );

                  return prev
                    .filter((prevMessage) =>
                      unreadMessages.some(
                        (newMessage) => newMessage.id === prevMessage.id
                      )
                    ) // Keep only those still unread
                    .concat(newNotifications); // Add new notifications
                });
              },
              (error) => {
                console.error("Error fetching unread messages: ", error);
              }
            );

            unsubscribeFns.push(unsubscribe);
          });

          // Return the clean-up function
          return () => unsubscribeFns.forEach((fn) => fn());
        } else {
          console.log("User does not exist");
        }
      })
      .catch((error) => {
        console.log("Error getting user document:", error);
      });
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
            {notification.senderName}: {notification.text}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default NotificationBell;
