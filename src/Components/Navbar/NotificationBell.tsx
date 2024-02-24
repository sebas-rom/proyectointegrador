import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([
    { sender: "Alice", message: "Hello!" },
    { sender: "Bob", message: "React is awesome!" },
    { sender: "Charlie", message: "Have you checked out Material UI?" },
  ]);

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
            {notification.sender}: {notification.message}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default NotificationBell;
