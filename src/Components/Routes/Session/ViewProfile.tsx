import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UserData, getUserData } from "../../../Contexts/Session/Firebase";
import CustomContainer from "../../DataDisplay/CustomContainer";
import { Stack } from "@mui/material";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar";

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
          <ColoredAvatar
            userName={userData?.firstName + " " + userData?.lastName}
            size="large"
            photoURL={userData?.photoURL}
          />
        </Stack>
      )}
    </CustomContainer>
  );
}

export default ViewProfile;
