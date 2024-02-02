import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { formatRelative, format } from "date-fns";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import noAvatar from "../../assets/noAvatar.webp";
import { auth } from "../../Contexts/Session/Firebase.tsx";
import { Box, styled } from "@mui/material";

const Message = ({
  createdAt = null,
  text = "",
  userName = "",
  photoURL = null,
  uid = "",
}) => {
  if (!text) return null;

  const isOwnMessage = uid === auth.currentUser.uid;

  // Memoized message date
  const messageDate = useMemo(() => {
    return createdAt?.seconds ? new Date(createdAt.seconds * 1000) : null;
  }, [createdAt]);

  return (
    <Stack
      direction={isOwnMessage ? "row" : "row-reverse"}
      marginBottom={1}
      justifyContent="flex-end"
      alignItems={"center"}
    >
      <Stack direction="column">
        <Paper
          sx={{
            padding: 1,
            borderBottomLeftRadius: isOwnMessage ? 5 : 15,
            borderTopRightRadius: isOwnMessage ? 5 : 15,
            borderBottomRightRadius: !isOwnMessage ? 5 : 15,
            borderTopLeftRadius: !isOwnMessage ? 5 : 15,
          }}
        >
          {userName && (
            <Typography variant="body1" color="primary">
              {userName}
            </Typography>
          )}
          <Typography variant="body1">{text}</Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            align="right"
            fontSize={11}
          >
            {messageDate && format(messageDate, "h:mm a")}
          </Typography>
        </Paper>
      </Stack>
      <div
        style={{
          marginLeft: isOwnMessage ? "5px" : "10px",
          marginRight: isOwnMessage ? "10px" : "5px",
        }}
      >
        {photoURL ? (
          <Avatar
            alt="Avatar"
            src={photoURL}
            sx={{
              width: 45,
              height: 45,
            }}
          />
        ) : (
          <div
            style={{
              width: 45,
              height: 45,
            }}
          ></div>
        )}
      </div>
    </Stack>
  );
};

Message.propTypes = {
  text: PropTypes.string,
  createdAt: PropTypes.shape({
    seconds: PropTypes.number,
  }),
  displayName: PropTypes.string,
  photoURL: PropTypes.string,
};

export default Message;
