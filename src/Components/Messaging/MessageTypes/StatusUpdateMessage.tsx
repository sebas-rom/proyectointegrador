import { Stack, Typography } from "@mui/material";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export interface StatusUpdateMessageProps {
  createdAt: { seconds: number } | null;
  text: string;
}

const StatusUpdateMessage: React.FC<StatusUpdateMessageProps> = ({
  createdAt,
  text,
}) => {
  const [formattedDate, setFormattedDate] = useState(null);
  useEffect(() => {
    setFormattedDate(
      format(
        createdAt?.seconds ? new Date(createdAt.seconds * 1000) : null,
        "h:mm a"
      )
    );
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
