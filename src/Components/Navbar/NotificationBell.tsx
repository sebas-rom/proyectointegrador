import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { db, auth, getUserData, USERS_COLLECTION, UserData } from "../../Contexts/Session/Firebase.tsx";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

/**
 * NotificationBell component that displays a notification bell icon with a badge indicating the number of unread notifications.
 * Clicking on the bell icon opens a menu displaying the unread notifications.
 * @param {boolean} usePrimaryColor - If true, the icon color will be set to primary, otherwise it will inherit the color from its parent.
 * @returns {JSX.Element} - The NotificationBell component UI.
 * @component
 */
const NotificationBell = ({ usePrimaryColor = false }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const userUid = auth.currentUser?.uid; // Use optional chaining to avoid errors if currentUser is null
  const navigate = useNavigate();

  useEffect(() => {
    if (!userUid) return; // Exit early if userUid is not available

    const unsubscribeFns = []; // To keep track of unsubscribe functions for clean-up
    let unsubscribeUserData;
    const fetchData = async () => {
      try {
        unsubscribeUserData = await onSnapshot(doc(db, USERS_COLLECTION, userUid), (doc) => {
          const tempUserData = doc.data() as UserData;
          if (tempUserData.chatRooms) {
            tempUserData.chatRooms.forEach((chatRoomId) => {
              const messagesQuery = query(
                collection(db, "chatrooms", chatRoomId, "messages"),
                where(`read.${userUid}`, "==", false),
              );
              const unsubscribe = onSnapshot(
                messagesQuery,
                async (querySnapshot) => {
                  const unreadMessagesPromises = querySnapshot.docs.map(async (doc) => {
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
                  });

                  const unreadMessages = await Promise.all(unreadMessagesPromises);

                  setNotifications((prev) => {
                    const newNotifications = unreadMessages.filter(
                      (newMessage) => !prev.some((prevMessage) => prevMessage.id === newMessage.id),
                    );

                    // Remove read messages from notifications
                    const updatedNotifications = prev.filter((prevMessage) =>
                      unreadMessages.some((newMessage) => newMessage.id === prevMessage.id),
                    );

                    return updatedNotifications.concat(newNotifications);
                  });
                },
                (error) => {
                  console.error("Error fetching unread messages: ", error);
                },
              );

              unsubscribeFns.push(unsubscribe);
            });
          }
        });
      } catch (error) {
        console.log("Error getting user document:", error);
      }
    };

    fetchData();

    // Return the clean-up function
    return () => {
      unsubscribeFns.forEach((fn) => fn());
      if (unsubscribeUserData) {
        unsubscribeUserData();
      }
    };
  }, [userUid]);

  /**
   * Handles click event on the notification bell icon.
   * Opens the notification menu.
   * @param {Event} event - The click event
   */
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handles click event on a notification.
   * Closes the notification menu and navigates to the corresponding chat room.
   * @param {Object} notification - The clicked notification object
   */
  const handleNotificationClick = (notification) => {
    setAnchorEl(null);
    navigate(`/messages/${notification.roomId}`);
  };

  /**
   * Closes the notification menu.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton color={usePrimaryColor ? "primary" : "inherit"} onClick={handleClick}>
        <Badge badgeContent={notifications.length} color="secondary">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {notifications.length === 0 ? (
          <MenuItem disabled>No new notifications</MenuItem>
        ) : (
          notifications.map((notification, index) => (
            <MenuItem key={index} onClick={() => handleNotificationClick(notification)}>
              {notification.senderName}:
              {notification.type === "file"
                ? " sent a file"
                : notification.type === "contract"
                  ? " sent a contract"
                  : notification.type === "chat-started"
                    ? " Started a chat"
                    : notification.type === "text"
                      ? " " + notification.text
                      : " " + notification.text}
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;
