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
import { auth, db, getUserData } from "../../Contexts/Session/Firebase";
import diacritics from "diacritics";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useFeedback } from "../../Contexts/Feedback/FeedbackContext.tsx";

const EditData = () => {
  const user = auth.currentUser;
  const [myUserDb, setMyUserDb] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastname, setLastname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const { setLoading } = useFeedback();
  //
  //
  // no-Docs-yet
  //
  //

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserData(auth.currentUser.uid);

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (firstName === myUserDb.firstName && lastname === myUserDb.lastName) {
      return; // No need to update if the data hasn't changed
    }

    try {
      setLoading(true);
      const uid = auth.currentUser.uid; // Assuming you have the current user's UID
      const userDocRef = doc(db, "users", uid); // Create a reference directly to the user's document

      // Check if the user’s document exists
      const docSnapshot = await getDoc(userDocRef);
      if (docSnapshot.exists()) {
        // Update the signUpCompleted field to true
        await updateDoc(userDocRef, {
          firstName: firstName,
          lastName: lastname,
          searchableFirstName: diacritics.remove(firstName).toLowerCase(),
          searchableLastName: diacritics.remove(lastname).toLowerCase(),
        });
        const displayName = `${firstName} ${lastname}`;
        await updateProfile(auth.currentUser, { displayName });
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error setting sign-up completion:", error);
      throw error; // Rethrow any errors for handling upstream
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Grid container justifyContent="center" alignItems="center">
        <Grid item xs={10} sm={8} md={6} lg={4}>
          <Paper elevation={3} style={{ padding: "20px" }}>
            <Box component="form" onSubmit={handleUpdateProfile}>
              <Typography variant="h5" align="center" gutterBottom>
                Edit Profile
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
              <TextField
                label="Phone Number"
                fullWidth
                margin="normal"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
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

export default EditData;
