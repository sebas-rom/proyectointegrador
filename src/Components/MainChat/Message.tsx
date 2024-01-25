import React from "react";
import PropTypes from "prop-types";
import { formatRelative, format } from "date-fns";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";

const formatDate = (date) => {
  let formattedDate = "";
  if (date) {
    // Convert the date in words relative to the current date
    formattedDate = formatRelative(date, new Date());
    // Uppercase the first letter
    formattedDate =
      formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  }
  return formattedDate;
};

const Message = ({
  createdAt = null,
  text = "",
  displayName = "",
  photoURL = "",
}) => {
  if (!text) return null;

  const messageDate = createdAt?.seconds
    ? new Date(createdAt.seconds * 1000)
    : null;

  return (
    <Container component="main" maxWidth="xs">
      {messageDate && (
        <>
          <Typography
            variant="subtitle1"
            align="center"
            color="textSecondary"
            gutterBottom
          >
            {format(messageDate, "EEEE d")}
          </Typography>
          <Divider />
        </>
      )}
      <Paper elevation={3} className="p-4 mb-4">
        <Stack direction="row" spacing={2} alignItems="center" marginBottom={2}>
          {photoURL && (
            <Avatar
              alt="Avatar"
              src={photoURL}
              sx={{ width: 45, height: 45 }}
            />
          )}
          <div>
            <Stack direction="row" alignItems="center">
              {displayName && (
                <Typography
                  variant="body1"
                  color="primary"
                  sx={{ marginRight: 2 }}
                >
                  {displayName}
                </Typography>
              )}
              {messageDate && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ marginRight: 2 }}
                >
                  {format(messageDate, "h:mm a")}
                </Typography>
              )}
            </Stack>
            <Typography variant="body1">{text}</Typography>
          </div>
        </Stack>
      </Paper>
    </Container>
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