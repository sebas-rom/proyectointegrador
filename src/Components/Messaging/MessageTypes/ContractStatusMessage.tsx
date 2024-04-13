import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { ContractUpdateMetadata, auth } from "../../../Contexts/Session/Firebase.tsx";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar.tsx";
import { formatMessageTime } from "../ChatUtils.tsx";
import CustomPaper from "../../DataDisplay/CustomPaper.tsx";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
/**
 * Interface for Message component props
 */
export interface MessageProps {
  /** The unique identifier for the message */
  id?: string;
  /** The creation timestamp of the message */
  createdAt?: { seconds: number } | null;
  /** The text content of the message */
  text?: string;
  /** The name of the user who sent the message */
  userName?: string;
  /** The URL of the user's profile picture */
  photoURL?: string | null;
  /** The unique identifier of the user who sent the message */
  uid?: string;
  /** The metadata for the contract update */
  contractUpdateMetadata?: ContractUpdateMetadata;
}

/**
 * Message component that renders an individual chat message.
 *
 * @param {MessageProps} props - The props for the message component.
 * @returns A React functional component that returns the message UI or null if no message text is provided.
 * @component
 */
const ContractStatusMessage: React.FC<MessageProps> = ({
  createdAt = null,
  text = "",
  userName = "",
  photoURL = null,
  uid = "",
  contractUpdateMetadata,
}) => {
  const [formattedDate, setFormattedDate] = useState(null);
  const isOwnMessage = uid === auth.currentUser?.uid;
  // Split text into lines
  const messageLines = text.split("\n");

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
      <Stack direction="column" sx={{ maxWidth: "70%" }}>
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
            {/* {messageLines.map((line, index) => (
              <Typography key={index} variant="body1">
                {line}
              </Typography>
            ))} */}
            {contractUpdateMetadata?.type === "milestone-funded" && (
              <Typography variant="body1">
                <b>Contract update:</b> A milestone has been funded
              </Typography>
            )}
            {contractUpdateMetadata?.type === "milestone-submitted" && (
              <Typography variant="body1">
                <b>Contract update:</b> A milestone has been submitted for revision
              </Typography>
            )}

            <Typography variant="body1" color="textSecondary">
              Title: {contractUpdateMetadata?.milestoneTitle}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Amount: ${contractUpdateMetadata?.milestoneAmount}
            </Typography>
            {contractUpdateMetadata?.type === "milestone-funded" && (
              <Link to={`/view-contract/${contractUpdateMetadata?.contractId}`} target="_blank">
                <Button>View Details</Button>
              </Link>
            )}

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

export default ContractStatusMessage;
