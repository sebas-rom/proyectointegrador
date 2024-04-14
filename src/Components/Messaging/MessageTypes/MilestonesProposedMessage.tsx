import { useEffect, useState } from "react";
import {
  CHATROOM_COLLECTION,
  CONTRACTS_COLLECTION,
  ContractData,
  MilestoneData,
  UserData,
  auth,
  db,
  getContractData,
  getUserData,
  sendMessageToChat,
} from "../../../Contexts/Session/Firebase";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BorderText from "../../DataDisplay/BorderText";
import { useNavigate } from "react-router-dom";
import { deleteDoc, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useFeedback } from "../../../Contexts/Feedback/FeedbackContext";
import { formatMessageTime } from "../ChatUtils";
import CustomPaper from "../../DataDisplay/CustomPaper";
import { set } from "date-fns";

/**
 * Represents props for the ContractMessage component.
 */
export interface ContractMessageProps {
  // The date of the contract message.
  createdAt: { seconds: number } | null;
  // The ID of the contract.
  contractId: string;
  // The ID of the chat room associated with the contract.
  chatRoomId: string;
  // The ID of the user.
  uid: string;
}

/**
 * Represents auxiliary typography components for displaying contract details.
 * @param text1 - The first part of the text.
 * @param text2 - The second part of the text.
 */
const AuxTypography = ({ text1, text2 }) => {
  return (
    <Typography display="inline">
      <Typography color="textSecondary" component="span">
        <i>{text1}</i>
      </Typography>
      {text2 ? text2 : "N/A"}
    </Typography>
  );
};

/**
 * Represents a skeleton component for loading contract messages.
 */
const ContactMessageSkeleton = () => {
  return (
    <Stack alignItems={"center"} spacing={2}>
      <Typography color="textSecondary">
        <Skeleton width={150} />
      </Typography>

      <Button disabled>
        <Skeleton width={40} />
      </Button>
      <Typography variant="body2" color="textSecondary" fontSize={11}>
        <Skeleton width={25} />
      </Typography>
    </Stack>
  );
};

/**
 * Represents the ContractMessage component for displaying contract details.
 * @param createdAt - The creation date of the contract.
 * @param contractId - The ID of the contract.
 * @param chatRoomId - The ID of the chat room associated with the contract.
 */
const MilestonesProposedMessage: React.FC<ContractMessageProps> = ({ createdAt, contractId, chatRoomId, uid }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contractData, setContractData] = useState<ContractData>();
  const [userData, setUserData] = useState<UserData>();
  const [isOwnMessage, setIsOwnMessage] = useState(false);
  const [formattedDate, setFormattedDate] = useState(null);
  const [openDialog, setopenDialog] = useState(false);
  const [status, setStatus] = useState("");
  const [milestoneData, setMilestoneData] = useState<MilestoneData[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const { setLoading: setLoadingFeedbackContext, showSnackbar } = useFeedback();
  const [awaitingResponse, setAwaitingResponse] = useState(false);

  // Fetch contract data
  useEffect(() => {
    let unsubscribeChat;
    const fetch = async () => {
      unsubscribeChat = await onSnapshot(doc(db, CONTRACTS_COLLECTION, contractId), async () => {
        const tempContractData = await getContractData(contractId);
        setContractData(tempContractData[0]);

        if (tempContractData[1] != null) {
          let tempNewMilestones = [];
          for (const milestone of tempContractData[1]) {
            if (milestone.status === "proposed") {
              setAwaitingResponse(true);
              if (milestone.proposedBy !== auth.currentUser.uid) {
                tempNewMilestones.push(milestone);
              }
            }
          }
          setMilestoneData(tempNewMilestones);
        }
        if (auth.currentUser.uid === uid) {
          setIsOwnMessage(true);
        } else {
          setIsOwnMessage(false);
        }
        setUserData(await getUserData(uid));

        setStatus(tempContractData[0].status || "pending");
        setLoading(false);
      });
    };
    fetch();
    return () => {
      if (unsubscribeChat) {
        unsubscribeChat();
      }
    };
  }, [contractId]);

  // Calculate total amount
  useEffect(() => {
    if (milestoneData) {
      setTotalAmount(milestoneData.reduce((acc, curr) => acc + curr.amount, 0));
    }
  }, [milestoneData]);

  /**
   * Effect hook to format the creation timestamp into a readable time string.
   */
  useEffect(() => {
    setFormattedDate(formatMessageTime(createdAt.seconds));
  }, [createdAt.seconds]);

  // Handle dialog open
  const handleClickOpen = () => {
    setopenDialog(true);
  };

  // Handle dialog close
  const handleClose = () => {
    setopenDialog(false);
  };

  // Handle milestone acceptance
  const handleAccept = async () => {
    try {
      setLoadingFeedbackContext(true);
      for (const milestone of milestoneData) {
        if (milestone.id) {
          // If the milestone has an ID, it already exists, so update it
          const milestoneDocRef = doc(db, `contracts/${contractId}/milestones`, milestone.id);
          await updateDoc(milestoneDocRef, {
            status: "pending",
          });
        }
      }
      //send it as a message:
      const currentUserData = (await getUserData(auth.currentUser.uid)) as UserData;
      const statusText = currentUserData.firstName + " accepted the milestone proposal";
      await sendMessageToChat(chatRoomId, statusText, "status-update");
      handleClose();
    } catch {
      showSnackbar("An error occurred", "error");
    } finally {
      setLoadingFeedbackContext(false);
    }
  };

  // Handle proposal of new terms
  const handleNewTerms = async () => {
    try {
      setLoadingFeedbackContext(true);
      navigate(`/propose-new-milestones/${contractId}`);
      handleClose();
    } catch {
      showSnackbar("An error occurred", "error");
    } finally {
      setLoadingFeedbackContext(false);
      handleClose();
    }
  };

  // Handle milestone decline
  const handleDecline = async () => {
    try {
      setLoadingFeedbackContext(true);
      for (const milestoneToDelete of milestoneData) {
        const milestoneDocRef = doc(db, `contracts/${contractId}/milestones`, milestoneToDelete.id);
        await deleteDoc(milestoneDocRef);
      }
      //send it as a message:
      const currentUserData = (await getUserData(auth.currentUser.uid)) as UserData;
      const statusText = currentUserData.firstName + " declined the milestone proposal.";
      await sendMessageToChat(chatRoomId, statusText, "status-update");
    } catch {
      showSnackbar("An error occurred", "error");
    } finally {
      setLoadingFeedbackContext(false);
      handleClose();
    }
  };

  return (
    <>
      <Stack alignItems={"center"} marginBottom={2}>
        <CustomPaper
          sx={{
            width: { xs: "90%", sm: "60%", md: "40%" },
            padding: "20px",
            boxShadow: 0,
          }}
          messagePaper
        >
          {!loading ? (
            <Stack alignItems={"center"} spacing={2}>
              <Typography color="textSecondary">{userData.firstName} Sent a Milestone Proposal</Typography>

              {!isOwnMessage && milestoneData.length > 0 && (
                <Button variant="outlined" onClick={() => handleClickOpen()}>
                  View Details
                </Button>
              )}

              {isOwnMessage && awaitingResponse && <BorderText color="warning" text="Waiting for response" />}

              <Typography variant="body2" color="textSecondary" fontSize={11}>
                {formattedDate ? formattedDate : "h:mm a"}
              </Typography>
            </Stack>
          ) : (
            <ContactMessageSkeleton />
          )}
        </CustomPaper>
      </Stack>
      {openDialog && (
        <Dialog open={openDialog} onClose={handleClose} fullWidth maxWidth={"md"}>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
            <IconButton onClick={handleClose} color="error">
              <CloseIcon />
            </IconButton>
          </Stack>

          <DialogContent>
            <Stack spacing={2}>
              <Typography variant="h3" textAlign={"center"}>
                {contractData?.title}
              </Typography>
              <Typography variant="body2">{contractData?.description}</Typography>

              <Typography variant="h5">New Milestones:</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Milestone</TableCell>
                      <TableCell align="center">Due Date</TableCell>
                      <TableCell align="center">Ammount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {milestoneData.map((milestone, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row" align="center">
                          <Typography>{milestone?.title}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography>{milestone?.dueDate}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography> ${milestone?.amount}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography>Total Ammount: ${totalAmount}</Typography>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Stack
              spacing={1}
              direction={"row"}
              alignContent={"space-between"}
              alignItems={"center"}
              justifyContent={"space-between"}
              sx={{ width: "100%" }}
            >
              <Stack direction={"row"} spacing={1}>
                <Button onClick={handleDecline} variant="contained" color="error">
                  Decline Offer
                </Button>
                <Button onClick={handleNewTerms} variant="outlined">
                  Propose New Terms
                </Button>
              </Stack>

              <Button onClick={handleAccept} variant="contained">
                Accept Offer
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default MilestonesProposedMessage;
