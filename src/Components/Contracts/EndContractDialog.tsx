import { Alert, Button, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import {
  CHATROOM_COLLECTION,
  CONTRACTS_COLLECTION,
  ContractData,
  FEEDBACK_COLLECTION,
  MilestoneData,
  UserData,
  auth,
  db,
  isFreelancer,
  sendMessageToChat,
} from "../../Contexts/Session/Firebase";
import CloseIcon from "@mui/icons-material/Close";
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useFeedback } from "../../Contexts/Feedback/FeedbackContext";
import FeedbackResponse from "./FeedbackResponse";

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
  /** The other user data */
  otherUserData: UserData;
  /** The contract data */
  contractData: ContractData;
}

const EndContractDialog: React.FC<CheckoutProps> = ({
  open,
  handleClose,
  milestones,
  contractId,
  chatRoomId,
  otherUserData,
  contractData,
}) => {
  const [hasMiletonesPending, setHasMilestonesPending] = useState(false);
  const [hasMilestonesSubmitted, setHasMilestonesSubmitted] = useState(false);
  const [hasMilestonesRevision, setHasMilestonesRevision] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [continueToFeedback, setContinueToFeedback] = useState(false);

  const { setLoading, showSnackbar } = useFeedback();
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
    const feedbackRef = collection(db, `${CONTRACTS_COLLECTION}/${contractId}/${FEEDBACK_COLLECTION}`);
    const feedbackStatusField = (await isFreelancer(auth.currentUser.uid)) ? "freelancerFeedback" : "clientFeedback";

    const feedbackQuery = query(feedbackRef, where("createdBy", "==", auth.currentUser.uid));
    const feedbackSnapshot = await getDocs(feedbackQuery);
    if (!feedbackSnapshot.empty) {
      showSnackbar("You have already provided feedback for this contract", "error");
    } else {
      await addDoc(feedbackRef, {
        contractId,
        createdBy: auth.currentUser.uid,
        forUser: otherUserData.uid,
        feedback,
        rating,
        createdAt: serverTimestamp(),
      });
    }

    await updateDoc(contractDocRef, {
      status: "ended",
      [`feedbackStatus.${feedbackStatusField}`]: true,
    });

    await updateDoc(chatRoomDocRef, {
      contractHistory: "completedContract",
    });

    const contractUpdateMetadata = {
      contractId,
      milestoneId: "",
      milestoneTitle: "",
      milestoneAmount: "",
      type: "contract-ended",
    };
    sendMessageToChat(contractData.chatRoomId, "The contract ended", "contract-update", {}, contractUpdateMetadata);
    showSnackbar("Contract ended", "success");
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
            <Stack spacing={2} alignItems={"center"} justifyContent={"center"}>
              {!continueToFeedback ? (
                <>
                  <Typography variant="h5" textAlign={"center"}>
                    Are you sure you want to end this contract?
                  </Typography>
                  <Typography variant="subtitle2" color={"gray"} textAlign={"center"}>
                    You’ll be prompted to provide feedback.
                  </Typography>
                  <Button onClick={() => setContinueToFeedback(true)}>Continue</Button>
                </>
              ) : (
                <>
                  <FeedbackResponse
                    setFeedback={setFeedback}
                    setRating={setRating}
                    rating={rating}
                    feedback={feedback}
                    otherUserData={otherUserData}
                  />
                  <Stack direction={"row"} justifyContent={"space-around"} width={"100%"}>
                    <Button
                      onClick={() => {
                        handleClose();
                        setContinueToFeedback(false);
                      }}
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
              )}
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
