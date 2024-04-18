import React from "react";
import { ContractData, FeedbackData, UserData } from "../../Contexts/Session/Firebase";
import CustomPaper from "../DataDisplay/CustomPaper";
import { Button, Divider, Rating, Typography } from "@mui/material";
/**
 * Interface for Message component props
 */
interface ViewContractFeedbackProps {
  isFreelancer: boolean;
  contractData: ContractData;
  freelancerFeedback: FeedbackData;
  clientFeedback: FeedbackData;
  otherUserData: UserData;
}

const ViewContractFeedback: React.FC<ViewContractFeedbackProps> = ({
  isFreelancer,
  contractData,
  freelancerFeedback,
  clientFeedback,
  otherUserData,
}) => {
  // Create a small component for ratings display
  const FeedbackDisplay = ({ feedbackData }) => (
    <>
      <Rating precision={0.5} value={feedbackData.rating} readOnly />
      <Typography>{feedbackData.feedback}</Typography>
    </>
  );
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
              <Button>Leave Feedback</Button>
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
              <Button>Leave Feedback</Button>
            </>
          )}
        </>
      )}
    </CustomPaper>
  );
};

export default ViewContractFeedback;
