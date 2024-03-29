import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  auth,
  CONTRACTS_COLLECTION,
  db,
  getContractData,
  getUserData,
  isFreelancer,
  MilestoneData,
  sendContractAsMessage,
} from "../../../Contexts/Session/Firebase";
import { useLoading } from "../../../Contexts/Loading/LoadingContext";
import {
  Alert,
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
import { set } from "date-fns";

//milestones cant be lower than 5
//due date cant be in the past
function ProposeContract() {
  const navigate = useNavigate();

  const { contractId } = useParams();
  const { setLoading } = useLoading();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [toUserName, setToUserName] = useState(null);
  const [toUserPhotoUrl, setToUserPhotoUrl] = useState(null);
  const [milestones, setMilestones] = useState<MilestoneData[]>([
    { title: "", description: "", amount: 0, dueDate: "", id: null },
  ]);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [previouslySaved, setPreviouslySaved] = useState(false);
  const [milestoneLowerThan5, setMilestoneLowerThan5] = useState(false);
  const [dueDateInPast, setDueDateInPast] = useState(false);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [contractData, setContractData] = useState(null);

  useEffect(() => {
    setLoading(true);
    const getContract = async () => {
      const contractData = await getContractData(contractId);
      if (contractData[0]) {
        setContractData(contractData);
        const toUserUid =
          contractData[0].freelancerUid === auth.currentUser.uid
            ? contractData[0].clientUid
            : contractData[0].freelancerUid;
        const toUserData = await getUserData(toUserUid);
        const name = toUserData.firstName + " " + toUserData.lastName;
        setPreviouslySaved(contractData[0].previouslySaved || false);
        setToUserName(name);
        setToUserPhotoUrl(toUserData.photoThumbURL || toUserData.photoURL);
        setChatRoomId(contractData[0].chatRoomId);
        setIsNegotiating(contractData[0].status === "negotiating");

        if (contractData[1] != null) {
          setTitle(contractData[0]?.title);
          setDescription(contractData[0]?.description);
          setMilestones(contractData[1]);
        }
      } else {
        navigate("/404");
      }
      setLoading(false);
    };
    getContract();
  }, []);

  useEffect(() => {
    let total = 0;
    for (const milestone of milestones) {
      if (!isNaN(milestone.amount)) {
        total += milestone.amount;
      }
    }

    setTotalAmount(total);

    let lowerThan5Count = 0;
    let dueDateInPastCount = 0;
    for (const [index, milestone] of milestones.entries()) {
      if (milestone.amount < 5) {
        lowerThan5Count++;
      }
      const now = new Date();
      const dueDate = new Date(milestone.dueDate);
      const yesterday = new Date(now.setDate(now.getDate() - 1)); // Set yesterday's date
      //compare if it is due date is before tomorrow
      if (dueDate < yesterday) {
        dueDateInPastCount++;
      }
    }
    setMilestoneLowerThan5(lowerThan5Count > 0);
    setDueDateInPast(dueDateInPastCount > 0);
  }, [milestones]);

  const handleCancel = async () => {
    if (previouslySaved) {
      navigate(-1);
      return;
    }
    try {
      setLoading(true);
      await deleteDoc(doc(db, CONTRACTS_COLLECTION, contractId));
    } finally {
      navigate(-1);
      setLoading(false);
    }
  };

  const handleUpdateContract = async (e) => {
    e.preventDefault();

    if (milestoneLowerThan5 || dueDateInPast) {
      return; // Stop form submission if milestones have errors
    }

    // If the user is negotiating, create a new contract instead of updating the existing one
    if (isNegotiating) {
      await createNewContract();
      return;
    }
    // Proceed with contract update if milestones are valid
    try {
      setLoading(true);
      const contractDocRef = doc(db, CONTRACTS_COLLECTION, contractId); // Create a reference directly to the user's document
      // Check if the user’s document exists
      const docSnapshot = await getDoc(contractDocRef);
      if (docSnapshot.exists()) {
        // Update the signUpCompleted field to true

        await updateDoc(contractDocRef, {
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
            });
          }
        }
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
      //   navigate(-1);
    }
  };

  const createNewContract = async () => {
    setLoading(true);
    const newDocRef = collection(db, CONTRACTS_COLLECTION);
    try {
      const docSnap = await addDoc(newDocRef, {
        proposedBy: auth.currentUser.uid,
        chatRoomId,
        title: title,
        description: description,
      });
      // Compare existing milestones with the new ones
      const milestonesRef = collection(
        db,
        `contracts/${contractId}/milestones`
      );
      for (const milestone of milestones) {
        // If the milestone doesn't have an ID, it's a new milestone, so add it
        await addDoc(milestonesRef, {
          title: milestone.title,
          amount: milestone.amount,
          dueDate: milestone.dueDate,
        });
      }
      //send it as a message:
      await sendContractAsMessage(chatRoomId, docSnap.id);
      setLoading(false);
      navigate(`/messages/${chatRoomId}`);
    } catch (error) {
      console.error("Error reserving contract ID:", error);
      // Handle errors appropriately, e.g., display an error message to the user
    }
  };

  const handleAddMilestone = () => {
    setMilestones((prevMilestones) => [
      ...prevMilestones,
      { title: "", description: "", amount: 0, dueDate: "", id: null },
    ]);
  };

  const handleDeleteMilestone = (index) => {
    if (milestones.length > 1) {
      setMilestones((prevMilestones) =>
        prevMilestones.filter((_, i) => i !== index)
      );
    }
  };
  return (
    <Container style={{ padding: "5px", marginTop: 10, marginBottom: 10 }}>
      <Paper elevation={2} style={{ padding: "20px" }}>
        <Stack spacing={2} alignItems={"center"}>
          {!isNegotiating ? (
            <Typography variant="h3">Propose Contract</Typography>
          ) : (
            <Typography variant="h3">Propose New Terms</Typography>
          )}

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
              <Typography variant="body1" sx={{ marginLeft: 2 }}>
                {index + 1}.
              </Typography>
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
                      startAdornment={
                        <InputAdornment position="start">$</InputAdornment>
                      }
                      label="Amount"
                      value={milestone.amount}
                      onChange={(e) =>
                        setMilestones((prevMilestones) =>
                          prevMilestones.map((m, i) =>
                            i === index
                              ? { ...m, amount: Number(e.target.value) || 0 }
                              : m
                          )
                        )
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid xs={index === 0 ? 6 : 5} md={index === 0 ? 3 : 2}>
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
                            i === index ? { ...m, dueDate: e.target.value } : m
                          )
                        )
                      }
                    />
                  </FormControl>
                </Grid>
                {index !== 0 && (
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
                )}
              </Grid>
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

          <Stack spacing={2} alignItems={"center"} justifyContent={"center"}>
            <Typography variant="h6">Total Amount: ${totalAmount}</Typography>
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
          <Stack spacing={2}>
            <div />
            {milestoneLowerThan5 && (
              <Alert variant="outlined" severity="error">
                Milestone cost can't be lower than $5
              </Alert>
            )}
            {dueDateInPast && (
              <Alert variant="outlined" severity="error">
                Due dates can't be in the past
              </Alert>
            )}
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProposeContract;
