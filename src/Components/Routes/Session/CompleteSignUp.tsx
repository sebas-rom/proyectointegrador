import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  FormControl,
  FormLabel,
  Container,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

import diacritics from "diacritics";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, db, getUserData } from "../../../Contexts/Session/Firebase.tsx";
import EditPhoto from "../../AccountEdit/EditPhoto.tsx";
import { useFeedback } from "../../../Contexts/Feedback/FeedbackContext.tsx";

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
const CompleteSignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [isFreelancer, setIsFreelancer] = useState(true);
  const [isFreelancerString, setIsFreelancerString] = useState("");
  const { setLoading } = useFeedback();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserData(auth.currentUser.uid);
        setFirstName(userData.firstName);
        setLastname(userData.lastName);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    //Avoid rerendering the component on missing dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Handles the submission of the profile update form;
   * updates the user's first and last name in the database.
   */
  const handleUpdateProfile = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

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
          phone: phone,
          isFreelancer: isFreelancer,
          signUpCompleted: true,
        });
        const displayName = `${firstName} ${lastname}`;
        await updateProfile(auth.currentUser, { displayName });
      }
    } catch (error) {
      console.error("Error setting sign-up completion:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: SelectChangeEvent) => {
    const temp = event.target.value;
    setIsFreelancerString(event.target.value as string);
    if (temp == "1") {
      setIsFreelancer(true);
    } else {
      setIsFreelancer(false);
    }
  };

  return (
    <Container maxWidth={"md"} sx={{ marginTop: 5 }}>
      <Box component="form" onSubmit={handleUpdateProfile}>
        <Typography variant="h5" align="center" gutterBottom>
          Complete Your Profile
        </Typography>
        <EditPhoto />
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
          required
          fullWidth
          margin="normal"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <FormControl fullWidth required>
          <FormLabel id="demo-radio-buttons-group-label">I am:</FormLabel>
          {/* <InputLabel id="demo-simple-select-label">Age</InputLabel> */}
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={isFreelancerString}
            label="Age"
            onChange={handleChange}
          >
            <MenuItem value={1}>A Freelancer</MenuItem>
            <MenuItem value={0}>A Client</MenuItem>
          </Select>
        </FormControl>

        <Stack alignItems={"center"}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            style={{ margin: "20px" }}
          >
            Update Profile
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default CompleteSignUp;
