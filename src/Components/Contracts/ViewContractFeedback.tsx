import React, { useState } from "react";
import { ContractData, FeedbackData, UserData } from "../../Contexts/Session/Firebase";
import CustomPaper from "../DataDisplay/CustomPaper";
import { Button, Divider, Rating, Typography } from "@mui/material";
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
  // Create a small component for ratings display
  const FeedbackDisplay = ({ feedbackData }) => (
    <>
      <Rating precision={0.5} value={feedbackData.rating} readOnly />
      <Typography>{feedbackData.feedback}</Typography>
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
      messagePaper
    >
      {isFreelancer && (
        <>
          <Typography>
            <b>{otherUserData?.firstName}'s feedback to you </b>
          </Typography>
          {contractData?.feedbackStatus.freelancerFeedback ? (
            <>
              {contractData?.feedbackStatus.clientFeedback ? (
                <>
                  <FeedbackDisplay feedbackData={clientFeedback} />
                </>
              ) : (
                <>
                  <Rating value={0} readOnly disabled />
                  <Typography color={"gray"} variant="subtitle1">
                    No feedback yet
                  </Typography>
                </>
              )}
              <Divider flexItem />
              <Typography>
                <b>Your feedback to {otherUserData?.firstName}</b>
              </Typography>
              <FeedbackDisplay feedbackData={freelancerFeedback} />
            </>
          ) : (
            <>
              <Typography>Submit your feedback to see {otherUserData.firstName}'s feedback</Typography>
              <Divider flexItem />
              <Typography>
                <b>Your feedback to {otherUserData?.firstName}</b>
              </Typography>
              <Button onClick={handleLeaveFeedback}>Leave Feedback</Button>
            </>
          )}
        </>
      )}
      {!isFreelancer && (
        <>
          <Typography>
            <b>{otherUserData?.firstName}'s feedback to you </b>
          </Typography>
          {contractData?.feedbackStatus.clientFeedback ? (
            <>
              {contractData?.feedbackStatus.freelancerFeedback ? (
                <>
                  <FeedbackDisplay feedbackData={freelancerFeedback} />
                </>
              ) : (
                <>
                  <Rating value={0} readOnly disabled />
                  <Typography color={"gray"} variant="subtitle1">
                    No feedback yet
                  </Typography>
                </>
              )}
              <Divider flexItem />
              <Typography>
                <b>Your feedback to {otherUserData?.firstName}</b>
              </Typography>
              <FeedbackDisplay feedbackData={clientFeedback} />
            </>
          ) : (
            <>
              <Typography>Submit your feedback to see {otherUserData.firstName}'s feedback</Typography>
              <Divider flexItem />
              <Typography>
                <b>Your feedback to {otherUserData?.firstName}</b>
              </Typography>
              <Button onClick={handleLeaveFeedback}>Leave Feedback</Button>
            </>
          )}
        </>
      )}
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
