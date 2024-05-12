import React, { useEffect, useState } from "react";
import { FEEDBACK_COLLECTION, FeedbackData, db } from "../../Contexts/Session/Firebase";
import { collectionGroup, getDocs, query, where } from "firebase/firestore";
import { Stack, Typography } from "@mui/material";
import ProfileFeedback from "./ProfileFeedback";
interface ProfileFeedbackProps {
  uid: string;
}
const FetchProfileFeedback: React.FC<ProfileFeedbackProps> = ({ uid }) => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<FeedbackData[]>([]);
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const feedbackRef = collectionGroup(db, FEEDBACK_COLLECTION);
      const feedbackQuery = query(feedbackRef, where("forUser", "==", uid));
      const querySnapshot = await getDocs(feedbackQuery);
      querySnapshot.forEach((doc) => {
        const tempReviews: FeedbackData[] = [];
        tempReviews.push(doc.data() as FeedbackData);
        setReviews(tempReviews);
      });
      setLoading(false);
    };
    fetchData();
  }, [uid]);

  return (
    <Stack>
      {loading ? (
        <>loading...</>
      ) : (
        <>
          {reviews.map((review, index) => (
            <div key={index}>
              <ProfileFeedback feedbackData={review} />
            </div>
          ))}
          {reviews.length === 0 && <Typography>No reviews yet</Typography>}
        </>
      )}
    </Stack>
  );
};

export default FetchProfileFeedback;
