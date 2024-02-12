import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Box,
  Container,
} from "@mui/material";
import { auth, db } from "../../Contexts/Session/Firebase.tsx";
import diacritics from "diacritics";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useLoading } from "../../Contexts/Loading/LoadingContext.tsx";

const CompleteSignUp = ({ setSignupCompleted }) => {
  const user = auth.currentUser;
  const [myUserDb, setMyUserDb] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastname, setLastname] = useState("");
  const usersRef = collection(db, "users");
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(
          query(usersRef, where("uid", "==", auth.currentUser.uid))
        );
        const userData = querySnapshot.docs[0].data();
        setMyUserDb(userData);
        setFirstName(userData.firstName);
        setLastname(userData.lastName);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (firstName === myUserDb?.firstName && lastname === myUserDb?.lastName) {
      return; // No need to update if the data hasn't changed
    }

    try {
      console.log("Updating user profile...");
      setLoading(true);
      const querySnapshot = await getDocs(
        query(usersRef, where("uid", "==", auth.currentUser.uid))
      );

      if (querySnapshot.docs.length > 0) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          firstName: firstName,
          lastName: lastname,
          searchableFirstName: diacritics.remove(firstName).toLowerCase(),
          searchableLastName: diacritics.remove(lastname).toLowerCase(),
          signUpCompleted: true,
        });
        setSignupCompleted(true); // This will hide the CompleteSignUp component
      } else {
        console.error("User not found.");
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      sx={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: "100%",
        position: "absolute",
        zIndex: 9999,
        minWidth: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.2)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center", // Center vertically
        justifyContent: "center", // Center horizontally
      }}
    >
      <Grid container justifyContent="center" alignItems="center">
        <Grid item xs={10} sm={8} md={6} lg={4}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Box component="form" onSubmit={handleUpdateProfile}>
              <Typography variant="h5" align="center" gutterBottom>
                Complete Your Profile
              </Typography>
              <TextField
                label="Name"
                fullWidth
                required
                margin="normal"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                label="Lastname"
                required
                fullWidth
                margin="normal"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />

              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                style={{ marginTop: "20px" }}
              >
                Update Profile
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CompleteSignUp;
