import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserData, getUserData } from "../../../Contexts/Session/Firebase";
import CustomContainer from "../../DataDisplay/CustomContainer";
import { Stack, Typography } from "@mui/material";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar";
import FetchProfileFeedback from "../../Profile/FetchProfileFeedback";
import LocationOnIcon from "@mui/icons-material/LocationOn";

function ViewProfile() {
  const { profileUID } = useParams();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>(null);
  useEffect(() => {
    setLoading(true);
    // fetch user data
    const fetchData = async () => {
      const data = (await getUserData(profileUID)) as UserData;
      setUserData(data);
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
              <Stack direction={"row"} alignItems={"center"}>
                <LocationOnIcon sx={{ color: "gray" }} />
                <Typography color={"gray"} variant="subtitle2">
                  {userData?.province + "," + userData?.city}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
          <Typography variant="h6">About</Typography>
          <Typography variant="body1">{userData?.about}</Typography>
          <Typography variant="h6">Skills</Typography>
          <Typography variant="h5">Reviews</Typography>
          <FetchProfileFeedback uid={profileUID} />
        </Stack>
      )}
    </CustomContainer>
  );
}

export default ViewProfile;
