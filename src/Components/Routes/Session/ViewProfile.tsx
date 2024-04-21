import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserData, auth, getUserData } from "../../../Contexts/Session/Firebase";
import CustomContainer from "../../DataDisplay/CustomContainer";
import { Button, Chip, Divider, Stack, Typography } from "@mui/material";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar";
import FetchProfileFeedback from "../../Profile/FetchProfileFeedback";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SendMessageToDialog from "../../FindPeople/SendMessageToDialog";
import ShowMoreText from "../../DataDisplay/ShowMoreText";

function ViewProfile() {
  const { profileUID } = useParams();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>(null);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);

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
    <>
      <CustomContainer>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <Stack spacing={2} width={"100%"}>
            <Stack direction="row" justifyContent={"space-between"} alignItems={"center"} spacing={2}>
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
                      {userData?.province + ", " + userData?.city}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>

              {userData.uid !== auth.currentUser?.uid && (
                <Button onClick={() => setOpenMessageDialog(true)} variant="outlined">
                  Send Message
                </Button>
              )}
            </Stack>

            <Typography variant="h4">{userData?.title}</Typography>

            <Divider flexItem />
            <ShowMoreText>
              {userData?.about?.split("\n").map((line, index) => (
                <Typography key={index}>{line}</Typography>
              ))}
            </ShowMoreText>

            {userData.isFreelancer && (
              <>
                <Divider flexItem />
                <Typography variant="h6">Skills</Typography>
                <Stack direction="row" flexWrap="wrap">
                  {userData.skills.map((skill, index) => (
                    <Chip key={index} label={skill} style={{ margin: 3 }} color="primary" variant="outlined" />
                  ))}
                </Stack>
              </>
            )}

            <Divider flexItem />
            <Typography variant="h5">Reviews</Typography>
            <FetchProfileFeedback uid={profileUID} />
          </Stack>
        )}
      </CustomContainer>
      <SendMessageToDialog open={openMessageDialog} handleClose={() => setOpenMessageDialog(false)} user={userData} />
    </>
  );
}

export default ViewProfile;
