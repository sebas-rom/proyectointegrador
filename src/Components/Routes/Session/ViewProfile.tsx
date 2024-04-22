import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ExperienceData, UserData, auth, getUserData } from "../../../Contexts/Session/Firebase";
import CustomContainer from "../../CustomMUI/CustomContainer";
import { Button, Chip, Divider, Stack, Typography } from "@mui/material";
import ColoredAvatar from "../../CustomMUI/ColoredAvatar";
import FetchProfileFeedback from "../../Profile/FetchProfileFeedback";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SendMessageToDialog from "../../FindPeople/SendMessageToDialog";
import ShowMoreText from "../../CustomMUI/ShowMoreText";
import CustomPaper from "../../CustomMUI/CustomPaper";
import CollapsibleText from "./CollapsibleText";

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
  }, [profileUID]);

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
                <Button onClick={() => setOpenMessageDialog(true)} variant="outlined" size="small">
                  Send Message
                </Button>
              )}
            </Stack>

            <Typography variant="h4">{userData?.title}</Typography>
            <Stack direction="row" flexWrap="wrap" alignContent={"flex-start"}>
              {userData?.skills.map((skill, index) => (
                <Chip key={index} label={skill} style={{ margin: 3 }} color="primary" variant="outlined" />
              ))}
            </Stack>
            <Divider flexItem />

            <CollapsibleText maxLines={10}>{userData.about}</CollapsibleText>

            {userData.isFreelancer && (
              <>
                <Divider flexItem />
                <Typography variant="h6">Experiences</Typography>
                <Stack spacing={2}>
                  {userData?.experiences.map((experience: ExperienceData, _) => (
                    <CustomPaper messagePaper sx={{ padding: 1 }}>
                      <Typography variant="h6">{experience.subject}</Typography>
                      <CollapsibleText>{experience.description}</CollapsibleText>
                    </CustomPaper>
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
