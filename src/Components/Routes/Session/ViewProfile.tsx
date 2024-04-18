import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FEEDBACK_COLLECTION, FeedbackData, UserData, auth, db, getUserData } from "../../../Contexts/Session/Firebase";
import CustomContainer from "../../DataDisplay/CustomContainer";
import { Stack, Typography } from "@mui/material";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar";
import { collectionGroup, getDocs, query, where } from "firebase/firestore";
import { set } from "date-fns";
import ProfileFeedback from "../../Profile/ProfileFeedback";

function ViewProfile() {
  const { profileUID } = useParams();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>(null);
  const [reviews, setReviews] = useState<FeedbackData[]>([]);
  useEffect(() => {
    setLoading(true);
    setReviews([]);
    // fetch user data
    const fetchData = async () => {
      const data = (await getUserData(profileUID)) as UserData;
      setUserData(data);
      const feedbackRef = collectionGroup(db, FEEDBACK_COLLECTION);
      const feedbackQuery = query(feedbackRef, where("forUser", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(feedbackQuery);

      querySnapshot.forEach((doc) => {
        const tempReviews: FeedbackData[] = [];
        tempReviews.push(doc.data() as FeedbackData);
        setReviews(tempReviews);
      });
      setLoading(false);
    };
    fetchData();
  }, []);
  return (
    <CustomContainer>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <ColoredAvatar
              userName={userData?.firstName + " " + userData?.lastName}
              size="large"
              photoURL={userData?.photoURL}
            />
            <Stack>
              <Typography variant="h4">{userData?.firstName + " " + userData?.lastName}</Typography>
              {userData.isFreelancer && <Typography variant="subtitle1">Freelaner</Typography>}
            </Stack>
          </Stack>
          <Typography variant="h6">About</Typography>
          <Typography variant="body1">userData.about</Typography>
          <Typography variant="h6">Skills</Typography>
          <Typography variant="h5">Reviews</Typography>
          <Stack>
            {reviews.map((review, index) => (
              <div key={index}>
                <ProfileFeedback feedbackData={review} />
              </div>
            ))}
          </Stack>
        </Stack>
      )}
    </CustomContainer>
  );
}

export default ViewProfile;
