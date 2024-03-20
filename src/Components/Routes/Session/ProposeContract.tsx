import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  auth,
  db,
  getUserData,
  MilestoneData,
  sendContractAsMessage,
} from "../../../Contexts/Session/Firebase";
import { useLoading } from "../../../Contexts/Loading/LoadingContext";
import {
  Box,
  Button,
  Container,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";

const CHATROOM_COLLECTION = "chatrooms";
const MESSAGES_COLLECTION = "messages";

function ProposeContract() {
  const navigate = useNavigate();

  const { contractId } = useParams();
  const { setLoading } = useLoading();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [toUserName, setToUserName] = useState(null);
  const [toUserPhotoUrl, setToUserPhotoUrl] = useState(null);
  const [milestones, setMilestones] = useState([
    { title: "", amount: "", dueDate: "", id: null },
  ]);
  const [chatRoomId, setChatRoomId] = useState(null);

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { title: "", amount: "", dueDate: "", id: null },
    ]);
  };

  const handleDeleteMilestone = (index) => {
    if (milestones.length > 1) {
      setMilestones((prevMilestones) =>
        prevMilestones.filter((_, i) => i !== index)
      );
    }
  };

  useEffect(() => {
    setLoading(true);
    const getContract = async () => {
      const contractRef = doc(db, "contracts", contractId);
      const docSnapshot = await getDoc(contractRef);

      if (docSnapshot.exists()) {
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
          setChatRoomId(docSnapshot.data().chatRoomId);
          if (docSnapshot.data().previouslySaved) {
            setTitle(docSnapshot.data().title);
            setDescription(docSnapshot.data().description);
            const milestonesRef = collection(
              db,
              `contracts/${contractId}/milestones`
            );
            const milestonesSnapshot = await getDocs(milestonesRef);
            const milestonesData = milestonesSnapshot.docs.map((doc) => ({
              ...(doc.data() as MilestoneData),
              id: doc.id,
            }));
            const tempMilestones = [];
            milestonesData.forEach((milestone) => {
              tempMilestones.push({
                title: milestone.title,
                amount: milestone.amount,
                dueDate: milestone.dueDate,
                id: milestone.id,
              });
            });
            setMilestones(tempMilestones);
            console.log(tempMilestones);
          }
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

  const handleCancel = async () => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "contracts", contractId));
    } finally {
      navigate(-1);
      setLoading(false);
    }
  };

  const handleUpdateContract = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const userDocRef = doc(db, "contracts", contractId); // Create a reference directly to the user's document
      // Check if the user’s document exists
      const docSnapshot = await getDoc(userDocRef);
      if (docSnapshot.exists()) {
        // Update the signUpCompleted field to true
        await updateDoc(userDocRef, {
          title: title,
          description: description,
          previouslySaved: true,
        });
        // Retrieve existing milestones from the database
        const milestonesRef = collection(
          db,
          `contracts/${contractId}/milestones`
        );
        const existingMilestonesSnapshot = await getDocs(milestonesRef);
        const existingMilestones = existingMilestonesSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );

        // Compare existing milestones with the new ones
        for (const milestone of milestones) {
          if (milestone.id) {
            // If the milestone has an ID, it already exists, so update it
            const milestoneDocRef = doc(
              db,
              `contracts/${contractId}/milestones`,
              milestone.id
            );
            await updateDoc(milestoneDocRef, {
              title: milestone.title,
              amount: milestone.amount,
              dueDate: milestone.dueDate,
            });
          } else {
            // If the milestone doesn't have an ID, it's a new milestone, so add it
            await addDoc(milestonesRef, {
              title: milestone.title,
              amount: milestone.amount,
              dueDate: milestone.dueDate,
              previouslySaved: true,
            });
          }
        }

        // Delete milestones that were removed by the user
        const existingMilestoneIds = existingMilestones.map(
          (milestone) => milestone.id
        );
        const newMilestoneIds = milestones.map((milestone) => milestone.id);
        const milestonesToDelete = existingMilestones.filter(
          (milestone) => !newMilestoneIds.includes(milestone.id)
        );
        for (const milestoneToDelete of milestonesToDelete) {
          const milestoneDocRef = doc(
            db,
            `contracts/${contractId}/milestones`,
            milestoneToDelete.id
          );
          await deleteDoc(milestoneDocRef);
        }

        //send it as a message:
        await sendContractAsMessage(chatRoomId, contractId);
      }
    } catch (error) {
      console.error("Error updating contract:", error);
      throw error; // Rethrow any errors for handling upstream
    } finally {
      setLoading(false);
      navigate(-1);
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
            <Typography variant="h5">Contract Details</Typography>
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
            <div />
          </Stack>

          <Typography variant="h5">Project Milestones</Typography>
          {milestones.map((milestone, index) => (
            <div key={index}>
              <Typography variant="h6" sx={{ marginLeft: 2 }}>
                {index + 1}.
              </Typography>
              {index == 0 ? (
                <Grid container columnSpacing={1} sx={{ width: "100%" }}>
                  <Grid xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel htmlFor={`milestone-${index + 1}-title`}>
                        Milestone {index + 1} Title
                      </InputLabel>
                      <OutlinedInput
                        required
                        id={`milestone-${index + 1}-title`}
                        label="Milestone Title"
                        value={milestone.title}
                        onChange={(e) =>
                          setMilestones((prevMilestones) =>
                            prevMilestones.map((m, i) =>
                              i === index ? { ...m, title: e.target.value } : m
                            )
                          )
                        }
                      />
                    </FormControl>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <FormControl fullWidth margin="normal" variant="outlined">
                      <InputLabel htmlFor={`milestone-${index + 1}-amount`}>
                        Amount
                      </InputLabel>
                      <OutlinedInput
                        required
                        id={`milestone-${index + 1}-amount`}
                        type="number"
                        startAdornment={
                          <InputAdornment position="start">$</InputAdornment>
                        }
                        label="Amount"
                        value={milestone.amount}
                        onChange={(e) =>
                          setMilestones((prevMilestones) =>
                            prevMilestones.map((m, i) =>
                              i === index ? { ...m, amount: e.target.value } : m
                            )
                          )
                        }
                      />
                    </FormControl>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <FormControl fullWidth margin="normal" variant="outlined">
                      <TextField
                        required
                        id={`milestone-${index + 1}-dueDate`}
                        type="date"
                        placeholder="Due Date"
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
                    </FormControl>
                  </Grid>
                </Grid>
              ) : (
                <>
                  <Grid container columnSpacing={1} sx={{ width: "100%" }}>
                    <Grid xs={12} md={6}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel htmlFor={`milestone-${index + 1}-title`}>
                          Milestone {index + 1} Title
                        </InputLabel>
                        <OutlinedInput
                          required
                          id={`milestone-${index + 1}-title`}
                          label="Milestone Title"
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
                      </FormControl>
                    </Grid>
                    <Grid xs={6} md={3}>
                      <FormControl fullWidth margin="normal" variant="outlined">
                        <InputLabel htmlFor={`milestone-${index + 1}-amount`}>
                          Amount
                        </InputLabel>
                        <OutlinedInput
                          required
                          id={`milestone-${index + 1}-amount`}
                          type="number"
                          startAdornment={
                            <InputAdornment position="start">$</InputAdornment>
                          }
                          label="Amount"
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
                      </FormControl>
                    </Grid>
                    <Grid xs={5} md={2}>
                      <FormControl fullWidth margin="normal" variant="outlined">
                        <TextField
                          required
                          id={`milestone-${index + 1}-dueDate`}
                          type="date"
                          placeholder="Due Date"
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
                      </FormControl>
                    </Grid>
                    <Grid xs={1}>
                      <Stack
                        sx={{
                          width: "100%",
                          height: "100%",
                        }}
                        alignContent={"center"}
                        justifyContent={"center"}
                      >
                        <Button
                          onClick={() => handleDeleteMilestone(index)}
                          color="error"
                        >
                          <DeleteOutlineIcon />
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </>
              )}
            </div>
          ))}

          <Stack spacing={2} alignItems={"center"}>
            <div />
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleAddMilestone()}
            >
              <AddIcon />
              Add Milestone
            </Button>
            <div />
          </Stack>

          <Stack
            spacing={2}
            alignItems={"center"}
            direction={"row"}
            justifyContent={"center"}
          >
            <Button variant="contained" color="primary" type="submit">
              Send Proposal
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleCancel()}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProposeContract;
