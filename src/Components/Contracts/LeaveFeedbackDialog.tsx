import { Button, Dialog, DialogContent, DialogTitle, IconButton, Stack } from "@mui/material";
import React, { useState } from "react";
import {
  CONTRACTS_COLLECTION,
  ContractData,
  FEEDBACK_COLLECTION,
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
  /** The unique identifier of the contract */
  contractId: string;
  /** The other user data */
  otherUserData: UserData;
  /** The contract data */
  contractData: ContractData;
}

const LeaveFeedbackDialog: React.FC<CheckoutProps> = ({
  open,
  handleClose,
  contractId,
  otherUserData,
  contractData,
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const { setLoading, showSnackbar } = useFeedback();

  const handleEndContract = async () => {
    // End the contract
    setLoading(true);
    const contractDocRef = doc(db, `${CONTRACTS_COLLECTION}/${contractId}`);
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
      [`feedbackStatus.${feedbackStatusField}`]: true,
    });

    const contractUpdateMetadata = {
      contractId,
      milestoneId: "",
      milestoneTitle: "",
      milestoneAmount: "",
      type: "feedback-left",
    };
    sendMessageToChat(contractData.chatRoomId, "Feedback left", "contract-update", {}, contractUpdateMetadata);
    showSnackbar("Feedback left", "success");
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
        <FeedbackResponse
          setFeedback={setFeedback}
          setRating={setRating}
          rating={rating}
          feedback={feedback}
          otherUserData={otherUserData}
        />
        <Stack direction={"row"} justifyContent={"space-around"} width={"100%"}>
          <Button
            color="error"
            onClick={() => {
              handleClose();
            }}
            style={{
              marginTop: "10px",
            }}
          >
            Close
          </Button>
          <Button
            variant="outlined"
            onClick={handleEndContract}
            style={{
              marginTop: "10px",
            }}
          >
            Submit Feedback
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveFeedbackDialog;
