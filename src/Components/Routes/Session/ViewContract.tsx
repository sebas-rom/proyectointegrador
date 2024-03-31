import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFeedback } from "../../../Contexts/Feedback/FeedbackContext";
import { collection, doc, onSnapshot } from "firebase/firestore";
import {
  CONTRACTS_COLLECTION,
  ContractData,
  MilestoneData,
  auth,
  db,
} from "../../../Contexts/Session/Firebase";
import {
  Button,
  Container,
  Paper,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import BorderText from "../../DataDisplay/BorderText";

function ViewContract() {
  const navigate = useNavigate();
  const { contractId } = useParams();
  //   const { setLoading } = useFeedback();
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFreelancer, setIsFreelancer] = useState(false);

  useEffect(() => {
    setLoading(true);
    let unsubscribeContract;
    let unsubscribeMilestones;
    // Fetch contract details
    const fetchDataAndListen = async () => {
      unsubscribeContract = onSnapshot(
        doc(db, CONTRACTS_COLLECTION, contractId),
        async (contract) => {
          const tempData = contract.data() as ContractData;
          setIsFreelancer(tempData.freelancerUid == auth.currentUser?.uid);
          setContractData(tempData);
          const milestonesRef = collection(
            db,
            `contracts/${contract.id}/milestones`
          );
          unsubscribeMilestones = await onSnapshot(milestonesRef, (docs) => {
            const tempMilestones = docs.docs.map((doc) => ({
              ...(doc.data() as MilestoneData),
              id: doc.id,
            }));
            setMilestones(tempMilestones);
            setLoading(false);
          });
        }
      );
    };
    fetchDataAndListen();

    return () => {
      if (unsubscribeContract) {
        unsubscribeContract();
      }
      if (unsubscribeMilestones) {
        unsubscribeMilestones();
      }
    };
  }, []);
  return (
    <>
      {!loading ? (
        <Container maxWidth="lg" sx={{ marginTop: 2 }}>
          <Paper sx={{ padding: 2 }}>
            <Typography variant="h2">{contractData?.title}</Typography>
            <Typography>{contractData?.description}</Typography>

            <Stepper orientation="vertical">
              {milestones.map((milestone) => (
                <Step
                  key={milestone.id}
                  active={milestone.status === "paid" || milestone.onScrow}
                >
                  <StepLabel>
                    <Typography>
                      <b>{milestone.title}</b>
                    </Typography>
                    {milestone.status === "pending" && !milestone.onScrow && (
                      <>
                        <Stack
                          direction="row"
                          justifyContent="flex-start"
                          alignItems="center"
                          spacing={2}
                        >
                          <Typography>${milestone.amount}</Typography>
                          {milestone.onScrow ? (
                            <Typography>On Scrow</Typography>
                          ) : (
                            <BorderText color="warning" text="Not Founded" />
                          )}
                        </Stack>
                        {!milestone.onScrow && !isFreelancer && (
                          <Button variant="outlined" sx={{ marginTop: 1 }}>
                            Found milestone
                          </Button>
                        )}
                      </>
                    )}
                  </StepLabel>

                  <StepContent>
                    <Stack
                      direction={"row"}
                      alignContent={"center"}
                      alignItems={"center"}
                      spacing={2}
                    >
                      <Typography>${milestone.amount}</Typography>

                      {milestone.status === "submitted" ? (
                        <>
                          {isFreelancer && (
                            <BorderText
                              color="info"
                              text="Waiting for aproval"
                            />
                          )}
                        </>
                      ) : (
                        <>
                          {milestone.onScrow ? (
                            <>
                              {milestone.status === "paid" ? (
                                <BorderText color="success" text="Paid" />
                              ) : (
                                <BorderText
                                  color="success"
                                  text="Active and Founded"
                                />
                              )}
                            </>
                          ) : (
                            <BorderText color="warning" text="Not Founded" />
                          )}
                        </>
                      )}
                    </Stack>

                    {milestone.onScrow && milestone.status === "pending" && (
                      <Button variant="outlined" sx={{ marginTop: 1 }}>
                        Request Payment
                      </Button>
                    )}
                    {milestone.status === "submitted" && !isFreelancer && (
                      <Button variant="outlined" sx={{ marginTop: 1 }}>
                        Accept Submission
                      </Button>
                    )}
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Container>
      ) : (
        <>Skeleton</>
      )}
    </>
  );
}

export default ViewContract;
