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
import { auth, db, getUserData } from "../../Contexts/Session/Firebase.tsx";
import diacritics from "diacritics";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useLoading } from "../../Contexts/Loading/LoadingContext.tsx";

/**
 * The component used for completing the user's sign-up process by updating their profile.
 * It initially fetches and displays the user's first and last name, allowing them to be
 * edited and subsequently updated in the database.
 *
 * @remarks
 * This component requires `setSignupCompleted` from its parent to signal that
 * the user has completed the sign-up process.
 *
 * @param props - The props object containing the `setSignupCompleted` function
 * to update the parent component's state.
 */
const CompleteSignUp = ({ setSignupCompleted }) => {
  const user = auth.currentUser;
  const [myUserDb, setMyUserDb] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastname, setLastname] = useState("");
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // fix thiss
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

  /**
   * Handles the submission of the profile update form;
   * updates the user's first and last name in the database.
   */
  const handleUpdateProfile = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (firstName === myUserDb?.firstName && lastname === myUserDb?.lastName) {
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
          signUpCompleted: true,
        });
      }
    } catch (error) {
      console.error("Error setting sign-up completion:", error);
    } finally {
      setLoading(false);
      setSignupCompleted(true);
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
        zIndex: 99,
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
