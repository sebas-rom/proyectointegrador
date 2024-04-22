import React, { useEffect, useState } from "react";
import { FileMetadata, auth } from "../../../Contexts/Session/Firebase";
import { Link, Stack, Tooltip, Typography } from "@mui/material";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar";
import DownloadIcon from "@mui/icons-material/Download";
import { formatMessageTime } from "../ChatUtils";
import CustomPaper from "../../DataDisplay/CustomPaper";

/**
 * Interface for Message component props
 */
export interface FileMessageProps {
  /** The unique identifier for the message */
  id?: string;
  /** The creation timestamp of the message */
  createdAt?: {
    seconds: number;
  } | null;
  /** The text content of the message */
  text?: string;
  /** The name of the user who sent the message */
  userName?: string;
  /** The URL of the user's profile picture */
  photoURL?: string | null;
  /** The unique identifier of the user who sent the message */
  uid?: string;
  /** Metadata associated with the file */
  metadata?: FileMetadata;
}

/**
 * Component for displaying a file message with associated metadata
 * @param {FileMessageProps} props - The props for the FileMessage component
 * @returns {JSX.Element} - The FileMessage component
 */
const FileMessage: React.FC<FileMessageProps> = ({
  createdAt = null,
  text = "",
  userName = "",
  photoURL = null,
  uid = "",
  metadata = {
    contentType: "file",
    fileName: "size",
    caption: "",
  },
}) => {
  const [formattedDate, setFormattedDate] = useState(null);
  const isOwnMessage = uid === auth.currentUser?.uid;

  /**
   * Effect hook to format the creation timestamp into a readable time string.
   */
  useEffect(() => {
    setFormattedDate(formatMessageTime(createdAt.seconds));
  }, [createdAt.seconds]);

  return (
    <Stack
      direction={isOwnMessage ? "row" : "row-reverse"}
      marginBottom={1}
      justifyContent="flex-end"
      alignItems={"center"}
    >
      <Stack
        direction="column"
        sx={{
          maxWidth: "70%",
        }}
      >
        <CustomPaper
          sx={{
            padding: "6px",
            borderRadius: 2,
            boxShadow: 0,
          }}
          messagePaper
        >
          {userName && (
            <Typography variant="body1" color="primary" textAlign={isOwnMessage ? "right" : "left"}>
              {userName}
            </Typography>
          )}
          <Stack alignItems={isOwnMessage ? "flex-end" : "flex-start"} justifyContent={"space-between"}>
            <Typography whiteSpace={"pre-line"}>{metadata?.caption}</Typography>
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
                <DownloadIcon
                  sx={{
                    marginRight: 1,
                  }}
                />
                {metadata.fileName ? metadata.fileName : "File"}
              </Link>
            </Tooltip>

            <Typography variant="body2" color="textSecondary" align="right" fontSize={11}>
              {formattedDate ? formattedDate : "h:mm a"}
            </Typography>
          </Stack>
        </CustomPaper>
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
