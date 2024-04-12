/**
 * React component for viewing a contract.
 * Allows users to see contract details, milestones, and make payments.
 * @remarks
 * This component utilizes Firebase Firestore for data storage and React Router DOM for navigation.
 * It also uses Material-UI components for the user interface.
 */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import {
  CONTRACTS_COLLECTION,
  ContractData,
  MilestoneData,
  UserData,
  auth,
  db,
  getUserData,
  sendMessageToChat,
} from "../../../Contexts/Session/Firebase";
import {
  Button,
  Container,
  Divider,
  Skeleton,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import BorderText from "../../DataDisplay/BorderText";
import MilestoneCheckout from "../../Paypal/MilestoneCheckout";
import ColoredAvatar from "../../DataDisplay/ColoredAvatar";
import { useFeedback } from "../../../Contexts/Feedback/FeedbackContext";
import CustomPaper from "../../DataDisplay/CustomPaper";

/**
 * Represents the ViewContract component.
 * @returns JSX element.
 */
function ViewContract() {
  const navigate = useNavigate();
  const { contractId } = useParams();
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFreelancer, setIsFreelancer] = useState(false);
  const [otherUserData, setOtherUserData] = useState<UserData>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [amountInEscrow, setAmountInEscrow] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [milestonesRemaining, setMilestonesRemaining] = useState(0);
  const [openCheckout, setOpenCheckout] = useState(false); // State to control the dialog
  const [selectedMilestoneToPay, setSelectedMilestoneToPay] =
    useState<MilestoneData | null>();
  const { showSnackbar } = useFeedback();

  /**
   * Updates totals based on milestones.
   */
  useEffect(() => {
    if (milestones) {
      setTotalAmount(milestones.reduce((acc, curr) => acc + curr.amount, 0));
      setAmountInEscrow(
        milestones.reduce(
          (acc, curr) =>
            acc + (curr.status === "paid" || curr.onEscrow ? curr.amount : 0),
          0
        )
      );
      setAmountPaid(
        milestones.reduce(
          (acc, curr) => acc + (curr.status === "paid" ? curr.amount : 0),
          0
        )
      );
      setMilestonesRemaining(
        milestones.reduce(
          (acc, curr) =>
            acc +
            (curr.status === "pending" && !curr.onEscrow ? curr.amount : 0),
          0
        )
      );
    }
  }, [milestones]);

  /**
   * Fetches contract details and milestones from Firestore.
   * Listens for changes and updates state accordingly.
   */
  useEffect(() => {
    setLoading(true);
    let unsubscribeContract;
    let unsubscribeMilestones; // Fetch contract details
    const fetchDataAndListen = async () => {
      unsubscribeContract = onSnapshot(
        doc(db, CONTRACTS_COLLECTION, contractId),
        async (contract) => {
          const tempData = contract.data() as ContractData;
          setIsFreelancer(tempData.freelancerUid == auth.currentUser?.uid);
          const otherUserUid =
            tempData.freelancerUid == auth.currentUser?.uid
              ? tempData.clientUid
              : tempData.freelancerUid;
          setOtherUserData(await getUserData(otherUserUid));
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
  }, [contractId]);

  /**
   * Handles payment of a milestone.
   * Sets up the selected milestone to be paid.
   * @param {MilestoneData} milestone - The milestone to be paid.
   */
  const handlePayMilestone = (milestone: MilestoneData) => {
    setSelectedMilestoneToPay(milestone);
    setOpenCheckout(true);
  };

  /**
   * Requests payment for a milestone.
   * Updates milestone status and sends a chat message.
   * @param {MilestoneData} milestone - The milestone for which payment is requested.
   */
  const handleRequestPayment = async (milestone: MilestoneData) => {
    console.log("Requesting payment for milestone", milestone);
    const milestoneRef = doc(
      db,
      `contracts/${contractId}/milestones/${milestone.id}`
    );
    await updateDoc(milestoneRef, {
      paymentRequested: true,
    });
    sendMessageToChat(contractData.chatRoomId, "Payment was requested");
    showSnackbar("Payment was requested", "success");
  };

  /**
   * Navigates to the chat associated with the contract.
   */
  const handleGoToChat = () => {
    navigate(`/messages/${contractData?.chatRoomId}`);
  };
  return (
    <>
      {!loading ? (
        <Container maxWidth="lg" sx={{ marginTop: "10px" }}>
          <CustomPaper sx={{ padding: 4 }}>
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              <ColoredAvatar
                userName={
                  otherUserData?.firstName + " " + otherUserData?.lastName
                }
                photoURL={otherUserData?.photoURL}
                size={"large"}
              />
              <Stack justifyContent="flex-start" alignItems="flex-start">
                <Typography variant="h4">
                  {"Contract with " +
                    otherUserData?.firstName +
                    " " +
                    otherUserData?.lastName}
                </Typography>
                <Button variant="outlined" onClick={handleGoToChat}>
                  Go To Chat
                </Button>
              </Stack>
            </Stack>

            <CustomPaper
              sx={{ padding: 2, marginTop: 2, boxShadow: 0 }}
              messagePaper
            >
              <Grid
                container
                columnSpacing={4}
                rowSpacing={2}
                sx={{ width: "100%" }}
              >
                <Grid md={2} xs={6}>
                  <Stack>
                    <Typography variant={"button"} textAlign={"center"}>
                      Project price
                    </Typography>
                    <Typography
                      fontSize={25}
                      fontWeight={400}
                      textAlign={"center"}
                    >
                      {"$ " + totalAmount}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid md={2} xs={6}>
                  <Stack>
                    <Typography variant={"button"} textAlign={"center"}>
                      In escrow
                    </Typography>
                    <Typography
                      fontSize={25}
                      fontWeight={400}
                      textAlign={"center"}
                    >
                      {"$ " + amountInEscrow}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid md={2} xs={6}>
                  <Stack>
                    <Typography variant={"button"} textAlign={"center"}>
                      Amount paid
                    </Typography>
                    <Typography
                      fontSize={25}
                      fontWeight={400}
                      textAlign={"center"}
                    >
                      {"$ " + amountPaid}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid md={3} xs={6}>
                  <Stack>
                    <Typography variant={"button"} textAlign={"center"}>
                      Milestones remaining
                    </Typography>
                    <Typography
                      fontSize={25}
                      fontWeight={400}
                      textAlign={"center"}
                    >
                      {"$ " + milestonesRemaining}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid md={3} xs={12}>
                  <Stack
                    direction={"row"}
                    spacing={2}
                    justifyContent={"flex-end"}
                  >
                    <Divider orientation="vertical" flexItem variant="middle" />
                    <Stack>
                      <Typography variant={"button"} textAlign={"center"}>
                        Total earnings
                      </Typography>
                      <Typography
                        fontSize={25}
                        fontWeight={600}
                        textAlign={"center"}
                      >
                        {"$ " + amountPaid}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </CustomPaper>
            <Stack spacing={2}>
              <div />
              <Typography variant="h2">{contractData?.title}</Typography>
              <Typography>{contractData?.description}</Typography>

              <Stepper orientation="vertical">
                {milestones.map((milestone) => (
                  <Step
                    key={milestone.id}
                    active={milestone.status === "paid" || milestone.onEscrow}
                  >
                    <StepLabel>
                      <Typography>
                        <b>{milestone.title}</b>
                      </Typography>
                      {milestone.status === "pending" &&
                        !milestone.onEscrow && (
                          <>
                            <Stack
                              direction="row"
                              justifyContent="flex-start"
                              alignItems="center"
                              spacing={2}
                            >
                              <Typography>${milestone.amount}</Typography>
                              {milestone.onEscrow ? (
                                <Typography>On Scrow</Typography>
                              ) : (
                                <BorderText color="warning" text="Not Funded" />
                              )}
                            </Stack>
                            {!milestone.onEscrow && !isFreelancer && (
                              <Button
                                variant="outlined"
                                sx={{ marginTop: 1 }}
                                onClick={() => handlePayMilestone(milestone)}
                              >
                                Fund milestone
                              </Button>
                              // create a checkout component to pay the milestone with milestone.ammount
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
                            {milestone.onEscrow ? (
                              <>
                                {milestone.status === "paid" ? (
                                  <BorderText color="success" text="Paid" />
                                ) : (
                                  <BorderText
                                    color="success"
                                    text="Active and Funded"
                                  />
                                )}
                              </>
                            ) : (
                              <BorderText color="warning" text="Not Funded" />
                            )}
                          </>
                        )}
                      </Stack>

                      {milestone.onEscrow &&
                        milestone.status === "pending" &&
                        isFreelancer && (
                          <Button
                            variant="outlined"
                            sx={{ marginTop: 1 }}
                            onClick={() => handleRequestPayment(milestone)}
                          >
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

              <Button>Propose New Milestones</Button>
            </Stack>
            {selectedMilestoneToPay && (
              //make lazy
              <MilestoneCheckout
                open={openCheckout} // Pass the state to control the dialog
                handleClose={() => setOpenCheckout(false)} // Close the dialog
                milestone={selectedMilestoneToPay} // Pass the milestone to pay
                contractId={contractId} // Pass the contract data
                chatRoomId={contractData.chatRoomId}
              />
            )}
          </CustomPaper>
        </Container>
      ) : (
        <>
          {/* skeleton */}
          <Container maxWidth="lg" sx={{ marginTop: "10px" }}>
            <CustomPaper sx={{ padding: 4 }}>
              <Stack direction={"row"} alignItems={"center"} spacing={2}>
                <ColoredAvatar size={"large"} makeSkeleton />
                <Stack justifyContent="flex-start" alignItems="flex-start">
                  <Typography variant="h4">
                    <Skeleton width={300} />
                  </Typography>
                  <Button>
                    <Skeleton width={50} />
                  </Button>
                </Stack>
              </Stack>

              <CustomPaper
                sx={{ padding: 2, marginTop: 2, boxShadow: 0 }}
                messagePaper
              >
                <Grid
                  container
                  columnSpacing={4}
                  rowSpacing={2}
                  sx={{ width: "100%" }}
                >
                  <Grid md={2} xs={6}>
                    <Stack>
                      <Typography variant={"button"} textAlign={"center"}>
                        <Skeleton width={100} />
                      </Typography>
                      <Typography
                        fontSize={25}
                        fontWeight={400}
                        textAlign={"center"}
                      >
                        <Skeleton />
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid md={2} xs={6}>
                    <Stack>
                      <Typography variant={"button"} textAlign={"center"}>
                        <Skeleton width={100} />
                      </Typography>
                      <Typography
                        fontSize={25}
                        fontWeight={400}
                        textAlign={"center"}
                      >
                        <Skeleton />
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid md={2} xs={6}>
                    <Stack>
                      <Typography variant={"button"} textAlign={"center"}>
                        <Skeleton width={100} />
                      </Typography>
                      <Typography
                        fontSize={25}
                        fontWeight={400}
                        textAlign={"center"}
                      >
                        <Skeleton />
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid md={3} xs={6}>
                    <Stack>
                      <Typography variant={"button"} textAlign={"center"}>
                        <Skeleton width={100} />
                      </Typography>
                      <Typography
                        fontSize={25}
                        fontWeight={400}
                        textAlign={"center"}
                      >
                        <Skeleton />
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid md={3} xs={12}>
                    <Stack
                      direction={"row"}
                      spacing={2}
                      justifyContent={"flex-end"}
                    >
                      <Divider
                        orientation="vertical"
                        flexItem
                        variant="middle"
                      />
                      <Stack>
                        <Typography variant={"button"} textAlign={"center"}>
                          <Skeleton width={100} />
                        </Typography>
                        <Typography
                          fontSize={25}
                          fontWeight={600}
                          textAlign={"center"}
                        >
                          <Skeleton />
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>
              </CustomPaper>

              <Stack spacing={2}>
                <div />
                <Typography variant="h2">
                  <Skeleton width={400} />
                </Typography>
                <Typography>
                  <Skeleton width={100} />
                </Typography>

                <Stepper orientation="vertical">
                  <Step active={false}>
                    <StepLabel>
                      <Typography>
                        <Skeleton width={200} />
                      </Typography>

                      <>
                        <Stack
                          direction="row"
                          justifyContent="flex-start"
                          alignItems="center"
                          spacing={2}
                        >
                          <Typography>
                            <Skeleton width={70} />
                          </Typography>

                          <Typography>
                            <Skeleton width={50} />
                          </Typography>
                        </Stack>
                      </>
                    </StepLabel>
                  </Step>
                  <Step active={false}>
                    <StepLabel>
                      <Typography>
                        <Skeleton width={200} />
                      </Typography>

                      <>
                        <Stack
                          direction="row"
                          justifyContent="flex-start"
                          alignItems="center"
                          spacing={2}
                        >
                          <Typography>
                            <Skeleton width={70} />
                          </Typography>

                          <Typography>
                            <Skeleton width={50} />
                          </Typography>
                        </Stack>
                      </>
                    </StepLabel>
                  </Step>
                  <Step active={false}>
                    <StepLabel>
                      <Typography>
                        <Skeleton width={200} />
                      </Typography>

                      <>
                        <Stack
                          direction="row"
                          justifyContent="flex-start"
                          alignItems="center"
                          spacing={2}
                        >
                          <Typography>
                            <Skeleton width={70} />
                          </Typography>

                          <Typography>
                            <Skeleton width={50} />
                          </Typography>
                        </Stack>
                      </>
                    </StepLabel>
                  </Step>
                  <Step active={false}>
                    <StepLabel>
                      <Typography>
                        <Skeleton width={200} />
                      </Typography>

                      <>
                        <Stack
                          direction="row"
                          justifyContent="flex-start"
                          alignItems="center"
                          spacing={2}
                        >
                          <Typography>
                            <Skeleton width={70} />
                          </Typography>

                          <Typography>
                            <Skeleton width={50} />
                          </Typography>
                        </Stack>
                      </>
                    </StepLabel>
                  </Step>
                </Stepper>
                <Button>
                  <Skeleton width={50} />
                </Button>
              </Stack>
            </CustomPaper>
          </Container>
        </>
      )}
    </>
  );
}

export default ViewContract;
