import { Rating, Stack, TextField, Typography } from "@mui/material";
import React from "react";
import { UserData } from "../../Contexts/Session/Firebase";

export interface FeedbackProps {
  setRating: (rating: number) => void;
  setFeedback: (feedback: string) => void;
  rating: number;
  feedback: string;
  otherUserData: UserData;
}

const FeedbackResponse: React.FC<FeedbackProps> = ({ setFeedback, setRating, rating, feedback, otherUserData }) => {
  return (
    <Stack spacing={2} alignItems={"center"} justifyContent={"center"} width={"100%"}>
      <Stack width={"100%"}>
        <Typography>How was your experience with {otherUserData.firstName}?</Typography>
      </Stack>
      <Rating
        name="half-rating"
        precision={0.5}
        value={rating}
        onChange={(_, newValue) => {
          setRating(newValue);
        }}
      />
      <Stack width={"100%"}>
        <Typography textAlign={"left"}>Have you got any feedback?</Typography>
      </Stack>
      <TextField
        placeholder="Your feedback helps to make the platform better for everyone"
        multiline
        rows={4}
        variant="outlined"
        fullWidth
        value={feedback}
        onChange={(event) => setFeedback(event.target.value)}
      />
      <Typography variant="subtitle2" color={"gray"} textAlign={"center"}>
        Your feedback will be public.
      </Typography>
    </Stack>
  );
};

export default FeedbackResponse;
