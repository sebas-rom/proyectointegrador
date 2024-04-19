import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
} from "@mui/material";

import diacritics from "diacritics";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { sendEmailVerification, updateProfile } from "firebase/auth";
import { auth, db, getUserData } from "../../../Contexts/Session/Firebase.tsx";
import EditPhoto from "../../AccountEdit/EditPhoto.tsx";
import { useFeedback } from "../../../Contexts/Feedback/FeedbackContext.tsx";
import LocationSelector from "../../AccountEdit/LocationSelector.tsx";
import CustomContainer from "../../DataDisplay/CustomContainer.tsx";
import TimedButton from "../../DataDisplay/TimedButton.tsx";

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
  const authUser = auth.currentUser;
  const [emailVerified, setEmailVerified] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastname, setLastname] = useState("");
  const [phone, setPhone] = useState("");
  const [isFreelancer, setIsFreelancer] = useState(true);
  const [isFreelancerString, setIsFreelancerString] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const { setLoading, showSnackbar } = useFeedback();

  useEffect(() => {
    if (auth.currentUser.emailVerified) {
      setEmailVerified(true);
    }
    const handleFocus = () => {
      // Reload user if user exists
      if (auth.currentUser) {
        auth.currentUser.reload().then(() => {
          // Update emailVerified state if user's email is verified
          if (auth.currentUser.emailVerified) {
            setEmailVerified(true);
          }
        });
      }
    };
    // Add event listener for focus event
    window.addEventListener("focus", handleFocus);
    return () => {
      // Remove event listener when component unmounts
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserData(auth.currentUser.uid);
        setFirstName(userData.firstName);
        setLastname(userData.lastName);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
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
      if (emailVerified) {
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
            city: selectedCity,
            province: selectedProvince,
          });
          const displayName = `${firstName} ${lastname}`;
          await updateProfile(auth.currentUser, {
            displayName,
          });
          setLoading(false);
          showSnackbar("Profile updated successfully", "success");
        }
      } else {
        showSnackbar("Please verify your email first", "error");
      }
    } catch (error) {
      console.error("Error setting sign-up completion:", error);
      showSnackbar("Error setting sign-up completion", "error");
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

  const onResendClick = async () => {
    sendEmailVerification(authUser);
  };

  return (
    <>
      <CustomContainer
        sx={{
          marginTop: 2,
          marginBottom: 2,
        }}
      >
        <Box component="form" onSubmit={handleUpdateProfile}>
          <Typography variant="h5" align="center" gutterBottom>
            Complete Your Profile
          </Typography>
          <EditPhoto />

          <Stack spacing={2}>
            <TextField label="Name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <TextField label="Lastname" required value={lastname} onChange={(e) => setLastname(e.target.value)} />
            <TextField label="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} />
            <LocationSelector
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
            />
            <FormControl required>
              <InputLabel id="city-label">I am:</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={isFreelancerString}
                label="I am:"
                onChange={handleChange}
              >
                <MenuItem value={1}>A Freelancer</MenuItem>
                <MenuItem value={0}>A Client</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Stack alignItems={"center"}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              style={{
                margin: "20px",
              }}
            >
              Update Profile
            </Button>
          </Stack>
        </Box>
      </CustomContainer>
      <Dialog open={!emailVerified}>
        <DialogTitle>Email Verification Required</DialogTitle>
        <DialogContent>
          <Typography variant="body1" align="center" gutterBottom>
            Please check your email inbox for the verification link. If you didn't receive the email, you can resend it.
          </Typography>
        </DialogContent>
        <DialogActions>
          <TimedButton onClick={onResendClick} color="primary" seconds={120}>
            Resend Email
          </TimedButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CompleteSignUp;
