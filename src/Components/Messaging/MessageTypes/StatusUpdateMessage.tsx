import { Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { formatMessageTime } from "../ChatUtils";

/**
 * Interface for StatusUpdateMessage component props
 */
export interface StatusUpdateMessageProps {
  /** The creation timestamp of the status update */
  createdAt: {
    seconds: number;
  } | null;
  /** The text content of the status update */
  text: string;
}

/**
 * StatusUpdateMessage component that renders a status update message.
 *
 * @param {StatusUpdateMessageProps} props - The props for the status update message component.
 * @returns A React functional component that returns the status update message UI.
 * @component
 */
const StatusUpdateMessage: React.FC<StatusUpdateMessageProps> = ({ createdAt, text }) => {
  const [formattedDate, setFormattedDate] = useState(null);

  /**
   * Effect hook to format the creation timestamp into a readable time string.
   */
  useEffect(() => {
    setFormattedDate(formatMessageTime(createdAt.seconds));
  }, [createdAt.seconds]);

  return (
    <Stack alignItems={"center"} spacing={2}>
      <Typography color={"textSecondary"}>
        {text} {formattedDate ? formattedDate : "h:mm a"}
      </Typography>
      <div />
    </Stack>
  );
};

export default StatusUpdateMessage;
