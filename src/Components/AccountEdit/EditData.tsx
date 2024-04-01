import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Box,
  Container,
  CircularProgress,
} from "@mui/material";
import {
  USERS_COLLECTION,
  UserData,
  auth,
  db,
} from "../../Contexts/Session/Firebase";
import diacritics from "diacritics";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useFeedback } from "../../Contexts/Feedback/FeedbackContext.tsx";

const EditData = () => {
  const [userData, setUserData] = useState<UserData>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const { setLoading, showSnackbar } = useFeedback();
  const [isUpdating, setIsUpdating] = useState(false);
  //
  //
  // no-Docs-yet
  //
  //

  useEffect(() => {
    console.log("useEffect");
    let unsubscribeUser;
    const fetchUser = async () => {
      try {
        setLoading(true);
        unsubscribeUser = await onSnapshot(
          doc(db, USERS_COLLECTION, auth.currentUser.uid),
          async (doc) => {
            if (doc.exists()) {
              const tempUserData = doc.data() as UserData;
              setUserData(tempUserData);
              setFirstName(tempUserData.firstName);
              setLastname(tempUserData.lastName);
              setPhone(tempUserData.phone);
              setLoading(false);
            }
          }
        );
      } catch (error) {
        showSnackbar("Error fetching user", "error");
        setLoading(false);
      }
    };
    fetchUser();
    return () => {
      if (unsubscribeUser) {
        unsubscribeUser();
      }
    };

    //Avoid rerendering the component on shwoSnackbar and setLoading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (
      firstName === userData.firstName &&
      lastName === userData.lastName &&
      phone === userData.phone
    ) {
      showSnackbar("No changes to update", "info");
      return; // No need to update if the data hasn't changed
    }

    try {
      setIsUpdating(true);
      console.log("handleUpdateProfile");
      const userDocRef = doc(db, USERS_COLLECTION, auth.currentUser.uid); // Create a reference directly to the user's document
      await updateDoc(userDocRef, {
        firstName: firstName,
        lastName: lastName,
        searchableFirstName: diacritics.remove(firstName).toLowerCase(),
        searchableLastName: diacritics.remove(lastName).toLowerCase(),
        phone: phone,
      });
      showSnackbar("Profile updated successfully", "success");
      setIsUpdating(false);
    } catch (error) {
      showSnackbar("Error updating profile", "error");
      setIsUpdating(false);
      throw error; // Rethrow any errors for handling upstream
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
                value={firstName || ""}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                label="Lastname"
                required
                fullWidth
                margin="normal"
                value={lastName || ""}
                onChange={(e) => setLastname(e.target.value)}
              />
              <TextField
                label="Phone Number"
                fullWidth
                margin="normal"
                value={phone || ""}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button
                disabled={isUpdating}
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                style={{ marginTop: "20px" }}
              >
                Update Profile
                {isUpdating && (
                  <CircularProgress color="inherit" sx={{ marginLeft: 2 }} />
                )}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EditData;
