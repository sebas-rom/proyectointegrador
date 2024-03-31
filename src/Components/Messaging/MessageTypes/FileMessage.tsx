import React, { useEffect, useState } from "react";
import { FileMetadata, auth } from "../../../Contexts/Session/Firebase";
import { Link, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { format } from "date-fns";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar";
import DownloadIcon from "@mui/icons-material/Download";

/**
 * Interface for Message component props
 */
export interface FileMessageProps {
  id?: string;
  createdAt?: { seconds: number } | null;
  text?: string;
  userName?: string;
  photoURL?: string | null;
  uid?: string;
  metadata?: FileMetadata;
}

const FileMessage: React.FC<FileMessageProps> = ({
  createdAt = null,
  text = "",
  userName = "",
  photoURL = null,
  uid = "",
  metadata = { contentType: "file", fileName: "size", caption: "" },
}) => {
  const [formattedDate, setFormattedDate] = useState(null);
  useEffect(() => {
    setFormattedDate(
      format(
        createdAt?.seconds ? new Date(createdAt.seconds * 1000) : null,
        "h:mm a"
      )
    );
  }, []);

  const messageLines = metadata.caption?.split("\n");
  const isOwnMessage = uid === auth.currentUser?.uid;

  return (
    <Stack
      direction={isOwnMessage ? "row" : "row-reverse"}
      marginBottom={1}
      justifyContent="flex-end"
      alignItems={"center"}
    >
      <Stack direction="column" sx={{ maxWidth: "70%" }}>
        <Paper
          sx={{
            padding: "6px",
            borderRadius: 2,
          }}
        >
          {userName && (
            <Typography
              variant="body1"
              color="primary"
              textAlign={isOwnMessage ? "right" : "left"}
            >
              {userName}
            </Typography>
          )}
          <Stack
            alignItems={isOwnMessage ? "flex-end" : "flex-start"}
            justifyContent={"space-between"}
          >
            {messageLines &&
              messageLines.map((line, index) => (
                <Typography key={index} variant="body1">
                  {line}
                </Typography>
              ))}
            <Tooltip title="Download file">
              <Link
                href={text}
                target="_blank"
                underline="hover"
                textOverflow={"ellipsis"}
                component={"a"}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  width: "fit-content",
                }}
              >
                <DownloadIcon sx={{ marginRight: 1 }} />
                {metadata.fileName ? metadata.fileName : "File"}
              </Link>
            </Tooltip>

            <Typography
              variant="body2"
              color="textSecondary"
              align="right"
              fontSize={11}
            >
              {formattedDate ? formattedDate : "h:mm a"}
            </Typography>
          </Stack>
        </Paper>
      </Stack>
      <div
        style={{
          marginLeft: isOwnMessage ? "5px" : "10px",
          marginRight: isOwnMessage ? "10px" : "5px",
        }}
      >
        {photoURL !== "no-display" ? (
          <ColoredAvatar userName={userName} photoURL={photoURL} />
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

export default FileMessage;
