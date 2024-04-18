import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUserData } from "../../../Contexts/Session/Firebase";

function ViewProfile() {
  const { uid } = useParams();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    setLoading(true);
    // fetch user data
    const fetchData = async () => {
      const data = await getUserData(uid);
      setUserData(data);
    };
    fetchData();
    setLoading(false);
  }, [uid]);
  return <>{loading ? <p>Loading...</p> : <p>Profile for user {uid}</p>}</>;
}

export default ViewProfile;
