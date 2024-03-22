import { lazy, useEffect, useState } from "react";
import {
  CONTRACTS_COLLECTION,
  ContractData,
  MilestoneData,
  UserData,
  auth,
  db,
  getContractData,
  getUserData,
} from "../../Contexts/Session/Firebase";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
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
import { format } from "date-fns";
import CloseIcon from "@mui/icons-material/Close";
import BorderText from "../@extended/BorderText";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export interface ContractMessageProps {
  createdAt?: { seconds: number } | null;
  contractId?: string;
}

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

//check if accepted = true, if not acceped, display
// wainting for user to respond
// View Details
// This oofer was accepted/ declined
const ContractMessage: React.FC<ContractMessageProps> = ({
  createdAt = null,
  contractId = "",
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
  useEffect(() => {
    const fetch = async () => {
      const contractData = await getContractData(contractId);
      setContractData(contractData[0]);
      setMilestoneData(contractData[1]);
      if (contractData[0].proposedBy === auth.currentUser.uid) {
        setIsOwnMessage(true);
      }
      if (contractData[0].proposedBy) {
        const userData = await getUserData(contractData[0].proposedBy);
        setUserData(userData);
      }
      setStatus(contractData[0].status || "pending");
      setLoading(false);
    };
    fetch();
  }, [contractId]);

  useEffect(() => {
    setFormattedDate(
      format(
        createdAt?.seconds ? new Date(createdAt.seconds * 1000) : null,
        "h:mm a"
      )
    );
  }, []);

  const handleClickOpen = () => {
    setopenDialog(true);
  };

  const handleClose = () => {
    setopenDialog(false);
  };

  //IMPROVE
  const handleAccept = async () => {
    const contractDocRef = doc(db, CONTRACTS_COLLECTION, contractId); // Create a reference directly to the user's document
    // Check if the user’s document exists
    const docSnapshot = await getDoc(contractDocRef);
    if (docSnapshot.exists()) {
      // Update the signUpCompleted field to true

      await updateDoc(contractDocRef, {
        status: "accepted",
      });
    }
    handleClose();
  };
  //IMPROVE
  const handleNewTerms = async () => {
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
  };

  return (
    <>
      <Stack alignItems={"center"} marginBottom={1}>
        <Paper
          sx={{ width: { xs: "90%", sm: "60%", md: "40%" }, padding: "20px" }}
        >
          {!loading ? (
            <Stack alignItems={"center"} spacing={2}>
              <Typography color="textSecondary">
                {userData.firstName} Sent a Contract Proposal
              </Typography>
              <Stack direction="column" spacing={1}>
                <AuxTypography text1="Title: " text2={contractData?.title} />
                <AuxTypography
                  text1="Description: "
                  text2={contractData?.description}
                />
                <AuxTypography
                  text1="Budget: "
                  text2={contractData?.totalAmount}
                />
              </Stack>

              {!isOwnMessage && status === "pending" && (
                <Button variant="outlined" onClick={() => handleClickOpen()}>
                  View Contract
                </Button>
              )}
              {isOwnMessage && status === "pending" && (
                <BorderText color="warning" text="Waiting for response" />
              )}
              {status === "accepted" && (
                <BorderText color="success" text="Offer Accepted" />
              )}
              {status === "declined" && (
                <BorderText color="error" text="Offer Declined" />
              )}
              {status === "negotiating" && (
                <BorderText color="info" text="New Terms Proposed" />
              )}

              <Typography variant="body2" color="textSecondary" fontSize={11}>
                {formattedDate ? formattedDate : "h:mm a"}
              </Typography>
            </Stack>
          ) : (
            <ContactMessageSkeleton />
          )}
        </Paper>
      </Stack>
      {openDialog && (
        <Dialog
          open={openDialog}
          onClose={handleClose}
          fullWidth
          maxWidth={"md"}
        >
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
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
              <Typography variant="body2">
                {contractData?.description}
              </Typography>

              <Typography variant="h5">Milestones:</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Milestone</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Ammount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {milestoneData.map((milestone, index) => (
                      <TableRow key={index}>
                        <TableCell component="th" scope="row">
                          <Typography>{milestone?.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography>{milestone?.dueDate}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography> ${milestone?.amount}</Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography>
                Total Ammount: ${contractData?.totalAmount}
              </Typography>
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleAccept} variant="contained">
              Accept Offer
            </Button>
            <Button onClick={handleNewTerms} variant="outlined">
              Propose New Terms
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default ContractMessage;
