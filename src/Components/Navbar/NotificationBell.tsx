import { useEffect, useState } from "react";
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
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const NotificationBell = ({ usePrimaryColor = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const userUid = auth.currentUser?.uid; // Use optional chaining to avoid errors if currentUser is null
  const navigate = useNavigate();

  useEffect(() => {
    if (!userUid) return; // Exit early if userUid is not available
    const userRef = doc(db, "users", userUid);

    const unsubscribeFns = []; // To keep track of unsubscribe functions for clean-up

    const fetchData = async () => {
      try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();

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
                      const senderName = `${userData.firstName} ${userData.lastName}`;

                      return {
                        id: doc.id,
                        senderName,
                        roomId: chatRoomId,
                        ...messageData,
                      };
                    } catch (error) {
                      console.error("Error fetching user name:", error);
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

                setNotifications((prev) => {
                  const newNotifications = unreadMessages.filter(
                    (newMessage) =>
                      !prev.some(
                        (prevMessage) => prevMessage.id === newMessage.id
                      )
                  );

                  // Remove read messages from notifications
                  const updatedNotifications = prev.filter((prevMessage) =>
                    unreadMessages.some(
                      (newMessage) => newMessage.id === prevMessage.id
                    )
                  );

                  return updatedNotifications.concat(newNotifications);
                });
              },
              (error) => {
                console.error("Error fetching unread messages: ", error);
              }
            );

            unsubscribeFns.push(unsubscribe);
          });
        } else {
          console.log("User does not exist");
        }
      } catch (error) {
        console.log("Error getting user document:", error);
      }
    };

    fetchData();

    // Return the clean-up function
    return () => unsubscribeFns.forEach((fn) => fn());
  }, [userUid]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (notification) => {
    setAnchorEl(null);
    navigate(`/messages/${notification.roomId}`);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton
        color={usePrimaryColor ? "primary" : "inherit"}
        onClick={handleClick}
      >
        <Badge badgeContent={notifications.length} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {notifications.length === 0 ? (
          <MenuItem disabled>No new notifications</MenuItem>
        ) : (
          notifications.map((notification, index) => (
            <MenuItem
              key={index}
              onClick={() => handleNotificationClick(notification)}
            >
              {notification.senderName}: {notification.text}
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
