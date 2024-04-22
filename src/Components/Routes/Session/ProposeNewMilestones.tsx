/**
 * React component for proposing or updating a contract.
 * Allows users to input contract details and milestones, and send a proposal.
 * @remarks
 * This component utilizes Firebase Firestore for data storage and React Router DOM for navigation.
 * It also uses Material-UI components for the user interface.
 */
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  auth,
  ContractData,
  CONTRACTS_COLLECTION,
  db,
  getContractData,
  getUserData,
  isFreelancer,
  MilestoneData,
  sendMessageToChat,
  UserData,
} from "../../../Contexts/Session/Firebase";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ColoredAvatar from "../../CustomMUI/ColoredAvatar";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import { useFeedback } from "../../../Contexts/Feedback/FeedbackContext";
import CustomPaper from "../../CustomMUI/CustomPaper";
import BorderText from "../../CustomMUI/BorderText";
import ProposeNewMilestoneSkeleton from "../../Contracts/ProposeNewMilestoneSkeleton";
import CustomContainer from "../../CustomMUI/CustomContainer";
import { MESSAGES_PATH } from "../routes";

/**
 * Represents the ProposeContract component.
 * @returns JSX element.
 */
function ProposeNewMilestones() {
  const navigate = useNavigate();
  const { contractId } = useParams();
  const { setLoading: setLoadingGlobal } = useFeedback();
  const [loading, setLoading] = useState(true);
  const [toUserName, setToUserName] = useState(null);
  const [toUserPhotoUrl, setToUserPhotoUrl] = useState(null);
  const [newMilestones, setNewMilestones] = useState<MilestoneData[]>([
    {
      title: "",
      amount: 0,
      dueDate: "",
      id: null,
    },
  ]);
  const [oldMilestones, setOldMilestones] = useState<MilestoneData[]>([]);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [milestoneLowerThan5, setMilestoneLowerThan5] = useState(false);
  const [dueDateInPast, setDueDateInPast] = useState(false);
  const [contractData, setContractData] = useState<ContractData>(null);
  const [amIfreelancer, setAmIfreelancer] = useState(false);

  /**
   * Fetches contract data from Firestore based on contractId.
   * Updates state variables accordingly.
   */
  useEffect(() => {
    setLoading(true);
    const getContract = async () => {
      const contractMilestoneData = await getContractData(contractId);
      if (contractMilestoneData[0]) {
        setContractData(contractMilestoneData[0]);
        const toUserUid =
          contractMilestoneData[0].freelancerUid === auth.currentUser.uid
            ? contractMilestoneData[0].clientUid
            : contractMilestoneData[0].freelancerUid;
        const toUserData = await getUserData(toUserUid);
        const name = toUserData.firstName + " " + toUserData.lastName;
        setToUserName(name);
        setToUserPhotoUrl(toUserData.photoThumbURL || toUserData.photoURL);
        setChatRoomId(contractMilestoneData[0].chatRoomId);
        setAmIfreelancer(await isFreelancer(auth.currentUser.uid));

        if (contractMilestoneData[1] != null) {
          let tempOldMilestones = [];
          let tempNewMilestones = [];
          for (const milestone of contractMilestoneData[1]) {
            if (milestone.status === "proposed") {
              tempNewMilestones.push(milestone);
            } else {
              tempOldMilestones.push(milestone);
            }
          }
          setOldMilestones(tempOldMilestones);
          if (tempNewMilestones.length > 0) {
            setNewMilestones(tempNewMilestones);
          }
        }
      } else {
        navigate("/404");
      }
      setLoading(false);
    };
    getContract();
  }, [contractId]);

  /**
   * Calculates total amount and checks for milestone errors.
   */
  useEffect(() => {
    let total = 0;
    for (const milestone of newMilestones) {
      if (!isNaN(milestone.amount)) {
        total += milestone.amount;
      }
    }

    setTotalAmount(total);

    let lowerThan5Count = 0;
    let dueDateInPastCount = 0;

    for (const [, milestone] of newMilestones.entries()) {
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
  }, [newMilestones]);

  /**
   * Handles cancellation of contract proposal.
   * Updates contract status if negotiating, otherwise deletes the contract.
   */
  const handleCancel = async () => {
    navigate(-1);
  };

  /**
   * Handles updating or proposing a new contract.
   * Validates milestones and updates Firestore accordingly.
   */
  const handleUpdateContract = async (e) => {
    e.preventDefault();

    if (milestoneLowerThan5 || dueDateInPast) {
      return; // Stop form submission if milestones have errors
    }
    // Proceed with contract update if milestones are valid
    try {
      setLoadingGlobal(true);
      const contractDocRef = doc(db, CONTRACTS_COLLECTION, contractId); // Create a reference directly to the user's document
      // Check if the user’s document exists
      const docSnapshot = await getDoc(contractDocRef);
      if (docSnapshot.exists()) {
        // Update the signUpCompleted field to true

        // Retrieve existing milestones from the database
        const milestonesRef = collection(db, `contracts/${contractId}/milestones`);
        // Compare existing milestones with the new ones
        for (const milestone of newMilestones) {
          if (milestone.id) {
            // If the milestone has an ID, it already exists, so update it
            const milestoneDocRef = doc(db, `contracts/${contractId}/milestones`, milestone.id);
            await updateDoc(milestoneDocRef, {
              title: milestone.title,
              amount: milestone.amount,
              dueDate: milestone.dueDate,
              status: "proposed",
              onEscrow: false,
              chatRoomId: chatRoomId,
              proposedBy: auth.currentUser.uid,
            });
          } else {
            // If the milestone doesn't have an ID, it's a new milestone, so add it
            await addDoc(milestonesRef, {
              title: milestone.title,
              amount: milestone.amount,
              dueDate: milestone.dueDate,
              status: "proposed",
              onEscrow: false,
              chatRoomId: chatRoomId,
              proposedBy: auth.currentUser.uid,
            });
          }
        }
        await sendMessageToChat(chatRoomId, contractId, "milestone-proposal");
        setLoadingGlobal(false);
        navigate(`/${MESSAGES_PATH}/${chatRoomId}`);
      }
    } catch (error) {
      console.error("Error updating contract:", error);
      throw error; // Rethrow any errors for handling upstream
    }
  };

  /**
   * Adds a new milestone to the milestones array.
   */
  const handleAddMilestone = () => {
    setNewMilestones((prevMilestones) => [
      ...prevMilestones,
      {
        title: "",
        description: "",
        amount: 0,
        dueDate: "",
        id: null,
      },
    ]);
  };

  /**
   * Deletes a milestone from the milestones array.
   * @param {number} index - Index of the milestone to delete.
   */
  const handleDeleteMilestone = (index) => {
    if (newMilestones.length > 1) {
      setNewMilestones((prevMilestones) => prevMilestones.filter((_, i) => i !== index));
    }
  };
  return (
    <CustomContainer>
      {loading ? (
        <ProposeNewMilestoneSkeleton />
      ) : (
        <>
          <Stack spacing={2} alignItems={"center"}>
            <Typography variant="h3">Propose new milestones</Typography>

            {toUserPhotoUrl != null && toUserName != null && (
              <Stack direction={"row"} alignContent={"center"} alignItems={"center"} spacing={1}>
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
              <Typography variant="h3">{contractData?.title}</Typography>
              <Typography variant="body1">{contractData?.description}</Typography>
              <div />
            </Stack>

            <Typography variant="h5">Current Milestones</Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Milestone</TableCell>
                    <TableCell align="center">Ammount</TableCell>
                    <TableCell align="center">Due Date</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {oldMilestones.map((milestone, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row" align="center">
                        <Typography>{milestone?.title}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography> ${milestone?.amount}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography>{milestone?.dueDate}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        {milestone?.status === "pending" && <BorderText color="warning" text="Pending" />}
                        {milestone?.status === "paid" && <BorderText color="success" text="Paid" />}
                        {milestone?.status === "revision" && <BorderText color="info" text="In revision" />}
                        {milestone?.status === "submitted" && <BorderText color="info" text="Submitted" />}
                        {milestone?.status === "refunded" && <BorderText color="error" text="Refunded" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Typography variant="h5">New Milestones</Typography>
            {newMilestones.map((milestone, index) => (
              <div key={index}>
                <Typography
                  variant="body1"
                  sx={{
                    marginLeft: 2,
                  }}
                >
                  {index + 1}.
                </Typography>
                <Grid
                  container
                  columnSpacing={1}
                  sx={{
                    width: "100%",
                  }}
                >
                  <Grid xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel htmlFor={`milestone-${index + 1}-title`}>Milestone {index + 1} Title</InputLabel>
                      <OutlinedInput
                        required
                        id={`milestone-${index + 1}-title`}
                        label="Milestone Title"
                        value={milestone.title}
                        onChange={(e) =>
                          setNewMilestones((prevMilestones) =>
                            prevMilestones.map((m, i) =>
                              i === index
                                ? {
                                    ...m,
                                    title: e.target.value,
                                  }
                                : m
                            )
                          )
                        }
                      />
                    </FormControl>
                  </Grid>
                  <Grid xs={6} md={3}>
                    <FormControl fullWidth margin="normal" variant="outlined">
                      <InputLabel htmlFor={`milestone-${index + 1}-amount`}>Amount</InputLabel>
                      <OutlinedInput
                        required
                        id={`milestone-${index + 1}-amount`}
                        startAdornment={<InputAdornment position="start">$</InputAdornment>}
                        label="Amount"
                        value={milestone.amount}
                        onChange={(e) =>
                          setNewMilestones((prevMilestones) =>
                            prevMilestones.map((m, i) =>
                              i === index
                                ? {
                                    ...m,
                                    amount: Number(e.target.value) || 0,
                                  }
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
                          setNewMilestones((prevMilestones) =>
                            prevMilestones.map((m, i) =>
                              i === index
                                ? {
                                    ...m,
                                    dueDate: e.target.value,
                                  }
                                : m
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
                        <Button onClick={() => handleDeleteMilestone(index)} color="error">
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
              <Button variant="outlined" color="primary" onClick={() => handleAddMilestone()}>
                <AddIcon />
                Add Milestone
              </Button>
              <div />
            </Stack>

            <Stack spacing={2} alignItems={"center"} justifyContent={"center"}>
              <Typography variant="h6">Total Amount for new milestones: ${totalAmount}</Typography>
              {amIfreelancer && totalAmount > 0 ? (
                <Typography variant="subtitle1">
                  Disclaimer: You will receive ${totalAmount * 0.95} after FreeEcu's 5% fee
                </Typography>
              ) : (
                <Typography variant="subtitle1">
                  Disclaimer: The freelancer will receive ${totalAmount * 0.95} after FreeEcu's 5% fee
                </Typography>
              )}

              <div />
            </Stack>
            <Stack spacing={2}>
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
              <div />
            </Stack>
            <Stack spacing={2} alignItems={"center"} direction={"row"} justifyContent={"center"}>
              <Button variant="contained" color="primary" type="submit">
                Send Proposal
              </Button>
              <Button variant="outlined" color="error" onClick={() => handleCancel()}>
                Cancel
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </CustomContainer>
  );
}

export default ProposeNewMilestones;
