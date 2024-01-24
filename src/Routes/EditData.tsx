import { useState, useEffect } from "react";
import { TextField, Button, Typography, Grid, Paper } from "@mui/material";
import { auth, uploadProfilePicture } from "../Contexts/Session/Firebase"; // Import your Firebase functions
import { set } from "firebase/database";

const EditData = () => {
  const user = auth.currentUser;
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState(false);
  useEffect(() => {
    if (user) {
      // Fetch user data from Firebase and populate the state
      // You can customize this based on your Firebase data structure
      setName(user.displayName || "");
      setPhoneNumber(user.phoneNumber || "");
      setVerifiedEmail(user.emailVerified || false);
      console.log(user.emailVerified);
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    // Update user profile in Firebase
    // You might want to add validation before updating
    // await upload(/* pass your file and user */);
    // Additional logic for updating other user data in Firebase
  };

  return (
    <Grid container justifyContent="center" alignItems="center" height="100vh">
      <Grid item xs={10} sm={8} md={6} lg={4}>
        <Paper elevation={3} style={{ padding: "20px" }}>
          <Typography variant="h5" align="center" gutterBottom>
            Edit Profile
          </Typography>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            label="Lastname"
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
          <p>Is verifiedEmail: {verifiedEmail}</p>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleUpdateProfile}
            style={{ marginTop: "20px" }}
          >
            Update Profile
          </Button>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default EditData;
