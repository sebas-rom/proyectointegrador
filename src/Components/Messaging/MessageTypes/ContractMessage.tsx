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
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useFeedback } from "../../../Contexts/Feedback/FeedbackContext";
import { formatMessageTime } from "../ChatUtils";
import CustomPaper from "../../DataDisplay/CustomPaper";

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
      <Stack direction="column" spacing={1}>
        <Typography>
          <Skeleton width={100} />
        </Typography>
        <Typography>
          <Skeleton width={75} />
        </Typography>
        <Typography>
          <Skeleton width={40} />
        </Typography>
      </Stack>
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
const ContractMessage: React.FC<ContractMessageProps> = ({
  createdAt,
  contractId,
  chatRoomId,
}) => {
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

  // Fetch contract data
  useEffect(() => {
    let unsubscribeChat;
    const fetch = async () => {
      unsubscribeChat = await onSnapshot(
        doc(db, CONTRACTS_COLLECTION, contractId),
        async () => {
          const tempContractData = await getContractData(contractId);
          setContractData(tempContractData[0]);
          setMilestoneData(tempContractData[1]);

          if (tempContractData[0].proposedBy === auth.currentUser.uid) {
            setIsOwnMessage(true);
          }
          if (tempContractData[0].proposedBy) {
            const userData = await getUserData(tempContractData[0].proposedBy);
            setUserData(userData);
          }
          setStatus(tempContractData[0].status || "pending");
          setLoading(false);
        }
      );
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

  // Handle contract acceptance
  const handleAccept = async () => {
    try {
      setLoadingFeedbackContext(true);
      const contractDocRef = doc(db, CONTRACTS_COLLECTION, contractId); // Create a reference directly to the user's document
      const chatDocRef = doc(db, CHATROOM_COLLECTION, chatRoomId);

      await updateDoc(contractDocRef, {
        status: "accepted",
      });

      await updateDoc(chatDocRef, {
        contractHistory: "activeContract",
        currentContractId: contractId,
      });

      const currentUserData = (await getUserData(
        auth.currentUser.uid
      )) as UserData;
      const statusText = currentUserData.firstName + " accepted a contract";
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
      //add loading state
      const contractDocRef = doc(db, CONTRACTS_COLLECTION, contractId); // Create a reference directly to the user's document
      // Check if the user’s document exists
      const docSnapshot = await getDoc(contractDocRef);
      if (docSnapshot.exists()) {
        await updateDoc(contractDocRef, {
          status: "negotiating",
        });
      }
      navigate(`/propose-contract/${contractId}`);
      handleClose();
    } catch {
      showSnackbar("An error occurred", "error");
    } finally {
      setLoadingFeedbackContext(false);
      handleClose();
    }
  };

  // Handle contract decline
  const handleDecline = async () => {
    try {
      setLoadingFeedbackContext(true);
      await updateDoc(doc(db, CONTRACTS_COLLECTION, contractId), {
        status: "declined",
      });
      const currentUserData = (await getUserData(
        auth.currentUser.uid
      )) as UserData;
      const statusText = currentUserData.firstName + " declined a contract";
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
              <Typography color="textSecondary">{userData.firstName} Sent a Contract Proposal</Typography>
              <Stack direction="column" spacing={1}>
                <AuxTypography text1="Title: " text2={contractData?.title} />
                <AuxTypography text1="Description: " text2={contractData?.description} />
                <AuxTypography text1="Budget: " text2={"$" + totalAmount} />
              </Stack>

              {!isOwnMessage && status === "pending" && (
                <Button variant="outlined" onClick={() => handleClickOpen()}>
                  View Contract
                </Button>
              )}

              {isOwnMessage && status === "pending" && <BorderText color="warning" text="Waiting for response" />}
              {status === "accepted" && <BorderText color="success" text="Offer Accepted" />}
              {status === "declined" && <BorderText color="error" text="Offer Declined" />}
              {status === "negotiating" && <BorderText color="info" text="New Terms Proposed" />}

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
            <DialogTitle variant="h5">Contract Proposal</DialogTitle>

            <IconButton onClick={handleClose} color="error">
              <CloseIcon />
            </IconButton>
          </Stack>

          <DialogContent>
            <Stack spacing={2}>
              <Typography variant="h3" textAlign={"center"}>
                {contractData?.title}
              </Typography>
              <Typography variant="h5"> {"Offer description:"}</Typography>
              <Typography variant="body2">{contractData?.description}</Typography>

              <Typography variant="h5">Milestones:</Typography>
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

export default ContractMessage;
