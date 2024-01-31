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
import { Box } from "@mui/material";

const Message = ({
  createdAt = null,
  text = "",
  userName = "",
  photoURL = "",
  uid = "",
}) => {
  if (!text) return null;

  const isOwnMessage = uid === auth.currentUser.uid;

  // Memoized message date
  const messageDate = useMemo(() => {
    return createdAt?.seconds ? new Date(createdAt.seconds * 1000) : null;
  }, [createdAt]);

  return (
    <Box>
      <Divider>
        <Typography
          variant="subtitle1"
          align="center"
          color="textSecondary"
          gutterBottom
        >
          {messageDate ? format(messageDate, "EEEE d") : "Today"}
        </Typography>
      </Divider>
      <Stack
        direction={isOwnMessage ? "row" : "row-reverse"}
        marginBottom={1}
        marginTop={1}
        justifyContent="flex-end"
        alignItems="flex-end"
        spacing={2}
      >
        <Stack direction="column">
          <>
            <Stack direction="row" alignItems="center">
              {userName && (
                <Typography
                  variant="body1"
                  color="primary"
                  sx={{ marginRight: 2 }}
                >
                  {userName}
                </Typography>
              )}
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ marginRight: 2 }}
              >
                {messageDate ? format(messageDate, "h:mm a") : "0:00 AM"}
              </Typography>
            </Stack>
            <Typography variant="body1">{text}</Typography>
          </>
        </Stack>
        <Avatar alt="Avatar" src={photoURL} sx={{ width: 45, height: 45 }} />
        <div></div> {/* Empty div for spacing */}
      </Stack>
    </Box>
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
