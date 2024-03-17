import { doc, getDoc, updateDoc } from "firebase/firestore";

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db, getUserData } from "../../../Contexts/Session/Firebase";
import { useLoading } from "../../../Contexts/Loading/LoadingContext";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar";

function ProposeContract() {
  const { contractId } = useParams();
  const { setLoading } = useLoading();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [toUserName, setToUserName] = useState(null);
  const [toUserPhotoUrl, setToUserPhotoUrl] = useState(null);

  // State for milestones
  const [milestones, setMilestones] = useState([
    {
      title: "",
      amount: "",
      dueDate: "",
    },
  ]);

  // Handle adding a new milestone
  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: "", amount: "", dueDate: "" }]);
  };

  // Handle deleting a milestone
  const handleDeleteMilestone = (index) => {
    if (milestones.length > 1) {
      setMilestones((prevMilestones) =>
        prevMilestones.filter((_, i) => i !== index)
      );
    }
  };

  const navigate = useNavigate();
  useEffect(() => {
    setLoading(true);
    console.log(contractId);
    const getContract = async () => {
      const contractRef = doc(db, "contracts", contractId);
      const docSnapshot = await getDoc(contractRef);

      if (docSnapshot.exists()) {
        console.log("Document data:", docSnapshot.data());
        if (
          docSnapshot.data().freelancerUid === auth.currentUser.uid ||
          docSnapshot.data().clientUid === auth.currentUser.uid
        ) {
          const toUserUid =
            docSnapshot.data().freelancerUid === auth.currentUser.uid
              ? docSnapshot.data().clientUid
              : docSnapshot.data().freelancerUid;
          const toUserData = await getUserData(toUserUid);
          const name = toUserData.firstName + " " + toUserData.lastName;
          setToUserName(name);
          setToUserPhotoUrl(toUserData.photoURL);
          setLoading(false);
        } else {
          setLoading(false);
          console.log("This is not your contract");
          navigate("/404");
        }
      } else {
        setLoading(false);
        console.log("No such document!");
        navigate("/404");
      }
    };
    getContract();
  }, []);
  const handleUpdateContract = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const uid = auth.currentUser.uid; // Assuming you have the current user's UID
      const userDocRef = doc(db, "users", uid); // Create a reference directly to the user's document

      // Check if the user’s document exists
      const docSnapshot = await getDoc(userDocRef);
      if (docSnapshot.exists()) {
        // Update the signUpCompleted field to true
        await updateDoc(userDocRef, {
          title: title,
          description: description,
          milestones: milestones.map((milestone) => ({
            ...milestone,
            // Consider formatting dueDate here if needed
          })),
        });
      }
    } catch (error) {
      console.error("Error updating contract:", error);
      throw error; // Rethrow any errors for handling upstream
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={{ padding: "5px", marginTop: 10, marginBottom: 10 }}>
      <Paper elevation={2} style={{ padding: "20px" }}>
        <Stack spacing={2} alignItems={"center"}>
          <Typography variant="h3">Propose Contract</Typography>
          {toUserPhotoUrl != null && toUserName != null && (
            <Stack
              direction={"row"}
              alignContent={"center"}
              alignItems={"center"}
              spacing={1}
            >
              <ColoredAvatar userName={toUserName} photoURL={toUserPhotoUrl} />
              <Typography variant="h6">To {toUserName}</Typography>
              <div />
            </Stack>
          )}

          <div />
        </Stack>

        <Box component="form" onSubmit={handleUpdateContract}>
          <Stack spacing={2}>
            <Typography variant="h6">Contract Details</Typography>
            <TextField
              label="Contract Title"
              fullWidth
              required
              margin="normal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Description"
              required
              fullWidth
              multiline
              minRows={4}
              margin="normal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Stack>

          <Stack spacing={2} alignItems={"flex-start"}>
            <Typography variant="h6">Project Milestones</Typography>
            <Grid container>
              {milestones.map((milestone, index) => (
                <>
                  {index == 0 ? (
                    <>
                      <Grid item xs={12} md={6}>
                        <TextField
                          required
                          label={`Milestone ${index + 1} Title`}
                          fullWidth
                          margin="normal"
                          value={milestone.title}
                          onChange={(e) =>
                            setMilestones((prevMilestones) =>
                              prevMilestones.map((m, i) =>
                                i === index
                                  ? { ...m, title: e.target.value }
                                  : m
                              )
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <TextField
                          required
                          label="Amount"
                          type="number"
                          fullWidth
                          margin="normal"
                          value={milestone.amount}
                          onChange={(e) =>
                            setMilestones((prevMilestones) =>
                              prevMilestones.map((m, i) =>
                                i === index
                                  ? { ...m, amount: e.target.value }
                                  : m
                              )
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <TextField
                          required
                          type="date"
                          fullWidth
                          margin="normal"
                          value={milestone.dueDate}
                          onChange={(e) =>
                            setMilestones((prevMilestones) =>
                              prevMilestones.map((m, i) =>
                                i === index
                                  ? { ...m, dueDate: e.target.value }
                                  : m
                              )
                            )
                          }
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12} md={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          required
                          label={`Milestone ${index + 1} Title`}
                          fullWidth
                          margin="normal"
                          value={milestone.title}
                          onChange={(e) =>
                            setMilestones((prevMilestones) =>
                              prevMilestones.map((m, i) =>
                                i === index
                                  ? { ...m, title: e.target.value }
                                  : m
                              )
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <TextField
                          required
                          label="Amount"
                          type="number"
                          fullWidth
                          margin="normal"
                          value={milestone.amount}
                          onChange={(e) =>
                            setMilestones((prevMilestones) =>
                              prevMilestones.map((m, i) =>
                                i === index
                                  ? { ...m, amount: e.target.value }
                                  : m
                              )
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={5} md={2}>
                        <TextField
                          required
                          type="date"
                          fullWidth
                          margin="normal"
                          value={milestone.dueDate}
                          onChange={(e) =>
                            setMilestones((prevMilestones) =>
                              prevMilestones.map((m, i) =>
                                i === index
                                  ? { ...m, dueDate: e.target.value }
                                  : m
                              )
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={1}>
                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          onClick={() => handleDeleteMilestone(index)}
                        >
                          Del
                        </Button>
                      </Grid>
                    </>
                  )}
                </>
              ))}
            </Grid>

            <Button
              variant="contained"
              color="primary"
              onClick={() => handleAddMilestone()}
            >
              Add Milestone
            </Button>
            <div />
          </Stack>

          <Button variant="contained" color="primary" type="submit">
            Send Proposal
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProposeContract;
