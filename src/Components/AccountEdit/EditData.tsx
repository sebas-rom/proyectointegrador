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
import { auth, db, updateDisplayName } from "../../Contexts/Session/Firebase";
import diacritics from "diacritics";
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useLoading } from "../../Contexts/Loading/LoadingContext.tsx";

const EditData = () => {
  const user = auth.currentUser;
  const [myUserDb, setMyUserDb] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastname, setLastname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
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
    if (firstName === myUserDb.firstName && lastname === myUserDb.lastName) {
      return; // No need to update if the data hasn't changed
    }

    try {
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
          // phoneNumber: phoneNumber, // Include phone number if needed
        });
        await updateDisplayName(firstName + " " + lastname);
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