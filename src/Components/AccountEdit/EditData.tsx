/**
 * React component for editing user profile data.
 * Retrieves user data from Firestore, allows editing, and updates the database.
 */
import { useState, useEffect } from "react";
import { TextField, Button, Typography, Box, CircularProgress, Stack } from "@mui/material";
import { ExperienceData, USERS_COLLECTION, UserData, auth, db } from "../../Contexts/Session/Firebase";
import diacritics from "diacritics";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useFeedback } from "../../Contexts/Feedback/FeedbackContext.tsx";
import CustomPaper from "../CustomMUI/CustomPaper.tsx";
import LocationSelector from "./LocationSelector.tsx";
import SkillsSelector from "./SkillsSelector.tsx";
import AddEmploymentHistory from "./AddEmploymentHistory.tsx";
import AddExperiences from "./AddExperiences.tsx";

/**
 * EditData component.
 * @returns JSX.Element
 */
const EditData = () => {
  // State variables for user data and form fields
  const [userData, setUserData] = useState<UserData>();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastname] = useState("");
  const [about, setAbout] = useState("");
  const [phone, setPhone] = useState("");
  const { showSnackbar } = useFeedback();
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [experiences, setExperiences] = useState<ExperienceData[]>([]);

  // Effect hook to fetch user data on component mount
  useEffect(() => {
    let unsubscribeUser;
    /**
     * Fetches user data from Firestore and sets state variables.
     * Also sets loading state and error handling.
     */
    const fetchUser = async () => {
      try {
        setLoading(true);
        unsubscribeUser = await onSnapshot(doc(db, USERS_COLLECTION, auth.currentUser.uid), async (doc) => {
          if (doc.exists()) {
            const tempUserData = doc.data() as UserData;
            setUserData(tempUserData);
            setFirstName(tempUserData.firstName);
            setLastname(tempUserData.lastName);
            setPhone(tempUserData.phone);
            setLoading(false);
            setSelectedCity(tempUserData?.city || "");
            setSelectedProvince(tempUserData?.province || "");
            setAbout(tempUserData?.about || "");
            setSkills(tempUserData?.skills || []);
            setTitle(tempUserData?.title || "");
            setExperiences(tempUserData?.experiences || []);
          }
        });
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

  /**
   * Handles form submission to update user profile.
   * @param {React.FormEvent<HTMLFormElement>} e - Form submission event
   */
  const handleUpdateProfile = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (
      firstName === userData.firstName &&
      lastName === userData.lastName &&
      phone === userData.phone &&
      selectedCity === userData.city &&
      selectedProvince === userData.province &&
      about === userData.about &&
      skills === userData.skills &&
      title === userData.title &&
      experiences === userData.experiences
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
        city: selectedCity,
        province: selectedProvince,
        about: about,
        skills: skills,
        title: title,
        experiences: experiences,
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
    <CustomPaper
      sx={{
        padding: "20px",
        width: "100%",
        maxWidth: "900px",
      }}
      messagePaper
    >
      <Box component="form" onSubmit={handleUpdateProfile}>
        <Typography variant="h5" align="center" gutterBottom>
          Edit Profile
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Name"
            required
            value={firstName || ""}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Lastname"
            required
            value={lastName || ""}
            onChange={(e) => setLastname(e.target.value)}
            disabled={loading}
          />
          <LocationSelector
            selectedCity={selectedCity}
            setSelectedCity={setSelectedCity}
            selectedProvince={selectedProvince}
            setSelectedProvince={setSelectedProvince}
          />
          <TextField
            label="Phone Number"
            value={phone || ""}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
          <TextField
            label="About me"
            multiline
            rows={5}
            value={about || ""}
            onChange={(e) => setAbout(e.target.value)}
            disabled={loading}
          />
          {userData?.isFreelancer && (
            <>
              <TextField
                label="Title"
                value={title || ""}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
              />
              <SkillsSelector skills={skills} setSkills={setSkills} />
              <AddEmploymentHistory />
              <AddExperiences experiences={experiences} setExperiences={setExperiences} />
            </>
          )}
        </Stack>
        <Button
          disabled={isUpdating || loading}
          variant="contained"
          color="primary"
          fullWidth
          type="submit"
          style={{
            marginTop: "20px",
          }}
        >
          Update Profile
          {isUpdating && (
            <CircularProgress
              color="inherit"
              sx={{
                marginLeft: 2,
              }}
            />
          )}
        </Button>
      </Box>
    </CustomPaper>
  );
};

export default EditData;
