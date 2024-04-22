import React, { useEffect, useState } from "react";
import { FeedbackData, UserData, getUserData } from "../../Contexts/Session/Firebase";
import { Rating, Skeleton, Stack, Typography } from "@mui/material";
import { format } from "date-fns";

interface ProfileFeedbackProps {
  feedbackData: FeedbackData;
}
const ProfileFeedback: React.FC<ProfileFeedbackProps> = ({ feedbackData }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>(null);
  useEffect(() => {
    setLoading(true);
    // fetch user data
    const fetchData = async () => {
      const data = (await getUserData(feedbackData.createdBy)) as UserData;
      setUserData(data);
      setLoading(false);
    };
    fetchData();
  }, [feedbackData.createdBy]);

  const formatDate = (seconds) => {
    const date = new Date(seconds * 1000);
    return format(date, "d/M/yy"); // Month and day (e.g., 4/8)
  };
  return (
    <>
      <Rating value={feedbackData.rating} readOnly />
      <Typography variant="subtitle2">
        <i>{'"' + feedbackData.feedback + '"'}</i>
      </Typography>
      {loading ? (
        <Typography variant="subtitle2">
          <Skeleton width={200} />
        </Typography>
      ) : (
        <Stack direction="row" justifyContent={"space-between"}>
          <Typography variant="subtitle2">
            <b>{"-" + userData?.firstName + " " + userData?.lastName}</b>
          </Typography>
          <Typography variant="subtitle2" color={"gray"}>
            {formatDate(feedbackData.createdAt.seconds)}
          </Typography>
        </Stack>
      )}
    </>
  );
};

export default ProfileFeedback;
