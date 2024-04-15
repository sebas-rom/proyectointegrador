import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  CHATROOM_COLLECTION,
  CONTRACTS_COLLECTION,
  ContractData,
  MilestoneData,
  db,
} from "../../Contexts/Session/Firebase";
import CloseIcon from "@mui/icons-material/Close";
import { doc, updateDoc } from "firebase/firestore";
import { useFeedback } from "../../Contexts/Feedback/FeedbackContext";
import { set } from "date-fns";

/**
 * Interface for component props
 */
export interface CheckoutProps {
  /** State to control the dialog open/close */
  open: boolean;
  /** Function to handle dialog close */
  handleClose: () => void;
  /** The milestone data to be paid for */
  milestones: MilestoneData[];
  /** The unique identifier of the contract */
  contractId: string;
  /** The unique identifier of the chat room */
  chatRoomId: string;
  /** The contract data */
  contractData: ContractData;
}

const EndContractDialog: React.FC<CheckoutProps> = ({
  open,
  handleClose,
  milestones,
  contractId,
  chatRoomId,
  contractData,
}) => {
  const [hasMiletonesPending, setHasMilestonesPending] = useState(false);
  const [hasMilestonesSubmitted, setHasMilestonesSubmitted] = useState(false);
  const [hasMilestonesRevision, setHasMilestonesRevision] = useState(false);
  const { setLoading } = useFeedback();
  useEffect(() => {
    const countPending = milestones.filter((milestone) => milestone.status === "pending").length;
    const countSubmitted = milestones.filter((milestone) => milestone.status === "submitted").length;
    const countRevision = milestones.filter((milestone) => milestone.status === "revision").length;
    if (countPending > 0) {
      setHasMilestonesPending(true);
    } else {
      setHasMilestonesPending(false);
    }
    if (countSubmitted > 0) {
      setHasMilestonesSubmitted(true);
    } else {
      setHasMilestonesSubmitted(false);
    }
    if (countRevision > 0) {
      setHasMilestonesRevision(true);
    } else {
      setHasMilestonesRevision(false);
    }
  }, [milestones]);

  const handleEndContract = async () => {
    // End the contract
    setLoading(true);
    const contractDocRef = doc(db, `${CONTRACTS_COLLECTION}/${contractId}`);
    const chatRoomDocRef = doc(db, `${CHATROOM_COLLECTION}/${chatRoomId}`);
    await updateDoc(contractDocRef, {
      status: "ended",
    });
    await updateDoc(chatRoomDocRef, {
      contractHistory: "completedContract",
    });
    setLoading(false);
    handleClose();
  };
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={"sm"}>
      <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
        <DialogTitle variant="h5">End Contract</DialogTitle>

        <IconButton onClick={handleClose} color="error">
          <CloseIcon />
        </IconButton>
      </Stack>
      <DialogContent dividers>
        {!hasMiletonesPending && !hasMilestonesRevision && !hasMilestonesSubmitted ? (
          <>
            <Typography variant="h5" textAlign={"center"}>
              Are you sure you want to end this contract?
            </Typography>
            <Typography variant="subtitle2" color={"gray"} textAlign={"center"}>
              You’ll be prompted to provide feedback and make any final payments in the following steps.
            </Typography>
            <Stack direction={"row"} justifyContent={"space-around"}>
              <Button
                onClick={handleClose}
                style={{
                  marginTop: "10px",
                }}
              >
                Close
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleEndContract}
                style={{
                  marginTop: "10px",
                }}
              >
                End Contract
              </Button>
            </Stack>
          </>
        ) : (
          <Stack spacing={1}>
            {hasMiletonesPending && <Alert severity="warning">This contract has pending milestones.</Alert>}
            {hasMilestonesRevision && (
              <Alert severity="warning">This contract has milestones that are under revision.</Alert>
            )}
            {hasMilestonesSubmitted && (
              <Alert severity="warning">This contract has milestones that are under revision.</Alert>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EndContractDialog;
