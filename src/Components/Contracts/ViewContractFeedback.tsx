import React, { useEffect, useState } from "react";
import { ContractData, FeedbackData, UserData } from "../../Contexts/Session/Firebase";
import CustomPaper from "../CustomMUI/CustomPaper";
import { Button, Divider, Rating, Stack, Typography } from "@mui/material";
import LeaveFeedbackDialog from "./LeaveFeedbackDialog";

/**
 * Interface for Message component props
 */
interface ViewContractFeedbackProps {
  isFreelancer: boolean;
  contractData: ContractData;
  freelancerFeedback: FeedbackData;
  clientFeedback: FeedbackData;
  otherUserData: UserData;
  contractId: string;
}

const ViewContractFeedback: React.FC<ViewContractFeedbackProps> = ({
  isFreelancer,
  contractData,
  freelancerFeedback,
  clientFeedback,
  otherUserData,
  contractId,
}) => {
  const [openLeaveFeedbackDialog, setOpenLeaveFeedbackDialog] = useState(false);
  const [myFeedback, setMyFeedback] = useState<FeedbackData | null>(null);
  const [otherFeedback, setOtherFeedback] = useState<FeedbackData | null>(null);
  const [hasReceivedFeedback, setHasReceivedFeedback] = useState(false);
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false);
  useEffect(() => {
    const feedbackStatus = contractData?.feedbackStatus;
    const hasGivenFeedback = isFreelancer ? feedbackStatus?.freelancerFeedback : feedbackStatus?.clientFeedback;
    const hasReceivedFeedback = isFreelancer ? feedbackStatus?.clientFeedback : feedbackStatus?.freelancerFeedback;
    const myFeedback = isFreelancer ? freelancerFeedback : clientFeedback;
    const otherFeedback = isFreelancer ? clientFeedback : freelancerFeedback;

    setHasGivenFeedback(!!hasGivenFeedback); // use !! to convert truthy/falsy to boolean
    setHasReceivedFeedback(!!hasReceivedFeedback);
    setMyFeedback(myFeedback);
    setOtherFeedback(otherFeedback);
  }, [contractData, isFreelancer, freelancerFeedback, clientFeedback]);

  // Create a small component for ratings display
  const FeedbackDisplay = ({ feedbackData }) => (
    <>
      <Rating precision={0.5} value={feedbackData?.rating} readOnly />
      <Typography>{feedbackData?.feedback}</Typography>
    </>
  );
  const handleLeaveFeedback = () => {
    setOpenLeaveFeedbackDialog(true);
  };
  return (
    <CustomPaper
      sx={{
        padding: 2,
        marginTop: 2,
        boxShadow: 0,
      }}
      grayVariant
    >
      <Stack spacing={2} alignItems={"flex-start"}>
        <Typography variant="h6">{otherUserData?.firstName}'s feedback to you </Typography>
        {hasGivenFeedback ? (
          <>
            {hasReceivedFeedback ? (
              <>
                <FeedbackDisplay feedbackData={otherFeedback} />
              </>
            ) : (
              <>
                <Rating value={0} readOnly disabled />
                <Typography color={"gray"} variant="subtitle1">
                  <i>No feedback yet</i>
                </Typography>
              </>
            )}
            <Divider flexItem />
            <Typography variant="h6">Your feedback to {otherUserData?.firstName}</Typography>
            <FeedbackDisplay feedbackData={myFeedback} />
          </>
        ) : (
          <>
            <Typography>
              <i>Submit your feedback to see {otherUserData.firstName}'s feedback</i>
            </Typography>
            <Divider flexItem />
            <Typography variant="h6">Your feedback to {otherUserData?.firstName}</Typography>
            <Button onClick={handleLeaveFeedback}>Leave Feedback</Button>
          </>
        )}
      </Stack>
      <LeaveFeedbackDialog
        open={openLeaveFeedbackDialog}
        handleClose={() => setOpenLeaveFeedbackDialog(false)}
        contractData={contractData}
        contractId={contractId}
        otherUserData={otherUserData}
      />
    </CustomPaper>
  );
};

export default ViewContractFeedback;
