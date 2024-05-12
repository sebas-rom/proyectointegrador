/**
 * React component for viewing a contract.
 * Allows users to see contract details, milestones, and make payments.
 * @remarks
 * This component utilizes Firebase Firestore for data storage and React Router DOM for navigation.
 * It also uses Material-UI components for the user interface.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import { addDoc, collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import {
  CONTRACTS_COLLECTION,
  ChatRoomData,
  ContractData,
  FEEDBACK_COLLECTION,
  FeedbackData,
  MILESTONES_COLLECTION,
  MilestoneData,
  UserData,
  auth,
  db,
  getChatRoomData,
  getUserData,
  makeTransaction,
  sendMessageToChat,
  isFreelancer as isFreelancerFirebase,
} from "../../../Contexts/Session/Firebase";
import { Alert, Button, Divider, Stack, Step, StepContent, StepLabel, Stepper, Typography } from "@mui/material";
import BorderText from "../../CustomMUI/BorderText";
import MilestoneCheckout from "../../Paypal/MilestoneCheckout";
import ColoredAvatar from "../../CustomMUI/ColoredAvatar";
import { useFeedback } from "../../../Contexts/Feedback/FeedbackContext";
import CustomPaper from "../../CustomMUI/CustomPaper";
import ViewContractSkeleton from "../../Contracts/ViewContractSkeleton";
import EndContractDialog from "../../Contracts/EndContractDialog";
import ViewContractFeedback from "../../Contracts/ViewContractFeedback";
import CustomContainer from "../../CustomMUI/CustomContainer";
import { MESSAGES_PATH, PROPOSE_CONTRACT_PATH, PROPOSE_NEW_MILESTONES_PATH } from "../routes";
import { set } from "date-fns";

/**
 * Calculates the total, in escrow, paid, and remaining amounts for milestones.
 * @param {MilestoneData[]} milestones - The milestones to calculate amounts for.
 * @returns An object containing the total, in escrow, paid, and remaining amounts.
 **/
export function calcMilestoneAmmounts(milestones: MilestoneData[]) {
  let inEscrow = 0;
  let paid = 0;
  let remaining = 0;
  let total = 0;
  for (const milestone of milestones) {
    if (milestone.status === "proposed") {
      continue;
    }
    total += milestone.amount;
    if (milestone.onEscrow && milestone.status !== "paid") {
      inEscrow += milestone.amount;
    } else if (milestone.status === "paid") {
      paid += milestone.amount;
    }
    if (!milestone.onEscrow) {
      remaining += milestone.amount;
    }
  }
  return {
    inEscrow,
    paid,
    remaining,
    total,
  };
}
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
  const [openEndContract, setOpenEndContract] = useState(false); // State to control the dialog
  const [selectedMilestoneToPay, setSelectedMilestoneToPay] = useState<MilestoneData | null>();
  const { showSnackbar, setLoading: setLoadingGlobal } = useFeedback();
  const [freelancerFeedback, setFreelancerFeedback] = useState<FeedbackData | null>();
  const [clientFeedback, setClientFeedback] = useState<FeedbackData | null>();
  /**
   * Updates totals based on milestones.
   */
  useEffect(() => {
    if (milestones) {
      const milestoneAmmount = calcMilestoneAmmounts(milestones);
      setAmountInEscrow(milestoneAmmount.inEscrow);
      setAmountPaid(milestoneAmmount.paid);
      setMilestonesRemaining(milestoneAmmount.remaining);
      setTotalAmount(milestoneAmmount.total);
    }
  }, [milestones]);

  /**
   * Fetches contract details and milestones from Firestore.
   * Listens for changes and updates state accordingly.
   */
  useEffect(() => {
    setLoading(true);
    let unsubscribeContract;
    let unsubscribeMilestones;
    let unsubscribeFeedback;
    const fetchDataAndListen = async () => {
      unsubscribeContract = onSnapshot(
        doc(db, CONTRACTS_COLLECTION, contractId),
        async (contract) => {
          const tempContractData = contract.data() as ContractData;
          setIsFreelancer(tempContractData.freelancerUid == auth.currentUser?.uid);
          const otherUserUid =
            tempContractData.freelancerUid == auth.currentUser?.uid
              ? tempContractData.clientUid
              : tempContractData.freelancerUid;
          setOtherUserData(await getUserData(otherUserUid));
          setContractData(tempContractData);
          const milestonesRef = collection(db, `${CONTRACTS_COLLECTION}/${contract.id}/${MILESTONES_COLLECTION}`);
          unsubscribeMilestones = await onSnapshot(
            milestonesRef,
            (docs) => {
              const tempMilestones = docs.docs.map((doc) => ({
                ...(doc.data() as MilestoneData),
                id: doc.id,
              }));
              const tempCurrentMilestones = [];
              for (const milestone of tempMilestones) {
                if (milestone.status !== "proposed") {
                  tempCurrentMilestones.push(milestone);
                }
              }
              // Sort milestones by due date in ascending order
              const sortedMilestones = tempCurrentMilestones.sort((a, b) => {
                const dateA = new Date(a.dueDate).getTime();
                const dateB = new Date(b.dueDate).getTime();
                return dateA - dateB;
              });
              setMilestones(sortedMilestones);
              setLoading(false);
            },
            (error) => {
              console.error("Error fetching milestones data", error);
              showSnackbar("Error fetching milestones data", "error");
            } //
          );
          if (tempContractData.status === "ended") {
            const feedbackRef = collection(db, `${CONTRACTS_COLLECTION}/${contract.id}/${FEEDBACK_COLLECTION}`);
            unsubscribeFeedback = await onSnapshot(
              feedbackRef,
              (docs) => {
                const tempFeedback = docs.docs.map((doc) => ({
                  ...(doc.data() as FeedbackData),
                  id: doc.id,
                }));
                for (const feedback of tempFeedback) {
                  if (feedback.createdBy === tempContractData.freelancerUid) {
                    setFreelancerFeedback(feedback);
                  } else {
                    setClientFeedback(feedback);
                  }
                }
              },
              (error) => {
                console.error("Error fetching feedback data", error);
                showSnackbar("Error fetching feedback data", "error");
              } //
            );
          }
        },
        (error) => {
          console.error("Error fetching contract data", error);
          showSnackbar("Error fetching contract data", "error");
        } //
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
      if (unsubscribeFeedback) {
        unsubscribeFeedback();
      }
    };
  }, [contractId]);

  /**
   * Handles payment of a milestone.
   * Sets up the selected milestone to be paid.
   * @param {MilestoneData} milestone - The milestone to be paid.
   */
  const handleFundMilestone = (milestone: MilestoneData) => {
    setSelectedMilestoneToPay(milestone);
    setOpenCheckout(true);
  };

  /**
   * Updates milestone status and sends a chat message.
   * @param {MilestoneData} milestone - The milestone for which action is performed.
   * @param {string} status - The status to update for the milestone.
   * @param {string} message - The message to send to the chat.
   * @param {string} messageType - The type of message.
   */
  const updateMilestoneStatus = async (milestone: MilestoneData, status, message, messageType) => {
    setLoadingGlobal(true);
    const milestoneRef = doc(db, `contracts/${contractId}/milestones/${milestone.id}`);
    console.log("Updating milestone status", milestoneRef.id, status);
    await updateDoc(milestoneRef, { status });
    const contractUpdateMetadata = {
      contractId,
      milestoneId: milestone.id,
      milestoneTitle: milestone.title,
      milestoneAmount: milestone.amount,
      type: messageType,
    };
    sendMessageToChat(contractData.chatRoomId, message, "contract-update", {}, contractUpdateMetadata);

    if (status === "paid") {
      const ammountAfterFees = milestone.amount * 0.95;
      await makeTransaction(contractData.clientUid, contractData.freelancerUid, ammountAfterFees, milestone.title);
    }

    showSnackbar(message, "success");
    setLoadingGlobal(false);
  };

  const handleSubmitMilestone = async (milestone) => {
    await updateMilestoneStatus(milestone, "submitted", "Payment was requested", "milestone-submitted");
  };

  const handleAcceptSubmission = async (milestone) => {
    await updateMilestoneStatus(milestone, "paid", "Payment was released", "milestone-paid");
  };

  const handleRequestRevision = async (milestone) => {
    await updateMilestoneStatus(milestone, "revision", "Revision was requested", "milestone-revision");
  };

  /**
   * Navigates to the chat associated with the contract.
   */
  const handleGoToChat = () => {
    navigate(`/${MESSAGES_PATH}/${contractData?.chatRoomId}`);
  };

  const handleProposeNewContract = async () => {
    const chatData = (await getChatRoomData(contractData?.chatRoomId)) as ChatRoomData;
    const newContractRef = collection(db, CONTRACTS_COLLECTION);
    try {
      setLoadingGlobal(true);
      const isCurrentUserFreelancer = await isFreelancerFirebase(auth.currentUser.uid);
      const otherUser = chatData.members.find((member) => member !== auth.currentUser.uid);
      const otherUserIsFreelancer = await isFreelancerFirebase(otherUser);
      if (isCurrentUserFreelancer === otherUserIsFreelancer) {
        showSnackbar("Error proposing contract: both users are the same type", "error");
        return;
      }
      let freelancerUid;
      let clientUid;
      if (isCurrentUserFreelancer) {
        freelancerUid = auth.currentUser.uid;
        clientUid = otherUser;
      } else {
        freelancerUid = otherUser;
        clientUid = auth.currentUser.uid;
      }

      const docSnap = await addDoc(newContractRef, {
        freelancerUid: freelancerUid,
        clientUid: clientUid,
        proposedBy: auth.currentUser.uid,
        status: "pending",
        createNewchat: true,
      });
      setLoadingGlobal(false);
      navigate(`/${PROPOSE_CONTRACT_PATH}/${docSnap.id}`);
    } catch (error) {
      console.error("Error reserving contract ID:", error);
      setLoadingGlobal(false);
    }
  };
  return (
    <>
      {!loading ? (
        <>
          <CustomContainer>
            <Stack direction={"row"} alignItems={"center"} spacing={2}>
              <ColoredAvatar
                userName={otherUserData?.firstName + " " + otherUserData?.lastName}
                photoURL={otherUserData?.photoURL}
                size={"large"}
              />
              <Stack justifyContent="flex-start" alignItems="flex-start">
                <Typography variant="h4">
                  {"Contract with " + otherUserData?.firstName + " " + otherUserData?.lastName}
                </Typography>
                <Button variant="outlined" onClick={handleGoToChat}>
                  Go To Chat
                </Button>
              </Stack>
            </Stack>

            <Stack spacing={2}>
              {contractData?.status === "ended" && (
                <>
                  <div />
                  <Alert
                    severity="info"
                    action={<Button onClick={() => handleProposeNewContract()}>Propose New Contract</Button>}
                  >
                    This contract has ended.
                  </Alert>
                  <ViewContractFeedback
                    isFreelancer={isFreelancer}
                    freelancerFeedback={freelancerFeedback}
                    clientFeedback={clientFeedback}
                    contractData={contractData}
                    otherUserData={otherUserData}
                    contractId={contractId}
                  />
                </>
              )}
            </Stack>

            <CustomPaper
              sx={{
                padding: 2,
                marginTop: 2,
              }}
              messagePaper
            >
              <Grid
                container
                columnSpacing={4}
                rowSpacing={2}
                sx={{
                  width: "100%",
                }}
              >
                <Grid md={2} xs={6}>
                  <Stack>
                    <Typography variant={"button"} textAlign={"center"}>
                      Project price
                    </Typography>
                    <Typography fontSize={25} fontWeight={400} textAlign={"center"}>
                      {"$ " + totalAmount}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid md={2} xs={6}>
                  <Stack>
                    <Typography variant={"button"} textAlign={"center"}>
                      In escrow
                    </Typography>
                    <Typography fontSize={25} fontWeight={400} textAlign={"center"}>
                      {"$ " + amountInEscrow}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid md={2} xs={6}>
                  <Stack>
                    <Typography variant={"button"} textAlign={"center"}>
                      Amount paid
                    </Typography>
                    <Typography fontSize={25} fontWeight={400} textAlign={"center"}>
                      {"$ " + amountPaid}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid md={3} xs={6}>
                  <Stack>
                    <Typography variant={"button"} textAlign={"center"}>
                      Milestones remaining
                    </Typography>
                    <Typography fontSize={25} fontWeight={400} textAlign={"center"}>
                      {"$ " + milestonesRemaining}
                    </Typography>
                  </Stack>
                </Grid>
                {isFreelancer && (
                  <Grid md={3} xs={12}>
                    <Stack direction={"row"} spacing={2} justifyContent={"flex-end"}>
                      <Divider orientation="vertical" flexItem variant="middle" />
                      <Stack>
                        <Typography variant={"button"} textAlign={"center"}>
                          Total earnings
                        </Typography>
                        <Typography fontSize={25} fontWeight={600} textAlign={"center"}>
                          {"$ " + amountPaid}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                )}
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
                    completed={milestone.status === "paid"}
                  >
                    <StepLabel>
                      <Typography>
                        <b>{milestone.title}</b>
                      </Typography>
                      {milestone.status === "pending" && !milestone.onEscrow && (
                        <>
                          <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
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
                              sx={{
                                marginTop: 1,
                              }}
                              onClick={() => handleFundMilestone(milestone)}
                            >
                              Fund milestone
                            </Button>
                          )}
                        </>
                      )}
                    </StepLabel>

                    <StepContent>
                      <Stack direction={"row"} alignContent={"center"} alignItems={"center"} spacing={2}>
                        <Typography>${milestone.amount}</Typography>

                        {milestone.status === "submitted" ? (
                          <>{isFreelancer && <BorderText color="info" text="Waiting for aproval" />}</>
                        ) : (
                          <>
                            {milestone.onEscrow ? (
                              <>
                                {milestone.status === "paid" && <BorderText color="success" text="Paid" />}
                                {milestone.status === "pending" && (
                                  <BorderText color="success" text="Active and Funded" />
                                )}
                                {milestone.status === "revision" && (
                                  <Stack spacing={1}>
                                    <BorderText color="info" text="Revision Requested" />
                                    {isFreelancer && (
                                      <Button variant="outlined" onClick={() => handleSubmitMilestone(milestone)}>
                                        Deliver Again
                                      </Button>
                                    )}
                                  </Stack>
                                )}
                              </>
                            ) : (
                              <BorderText color="warning" text="Not Funded" />
                            )}
                          </>
                        )}
                      </Stack>

                      {milestone.onEscrow && milestone.status === "pending" && isFreelancer && (
                        <Button
                          variant="outlined"
                          sx={{
                            marginTop: 1,
                          }}
                          onClick={() => handleSubmitMilestone(milestone)}
                        >
                          Submit Milestone
                        </Button>
                      )}
                      {milestone.onEscrow && milestone.status === "pending" && !isFreelancer && (
                        <Button
                          variant="outlined"
                          sx={{
                            marginTop: 1,
                          }}
                          onClick={() => handleAcceptSubmission(milestone)}
                        >
                          Release Funds
                        </Button>
                      )}
                      {milestone.status === "submitted" && !isFreelancer && (
                        <Stack
                          direction={"row"}
                          spacing={2}
                          sx={{
                            marginTop: 1,
                          }}
                        >
                          <Button variant="outlined" onClick={() => handleAcceptSubmission(milestone)}>
                            Accept Submission
                          </Button>
                          <Button variant="outlined" onClick={() => handleRequestRevision(milestone)}>
                            Request Revision
                          </Button>
                        </Stack>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>

              {contractData?.status !== "ended" && (
                <>
                  <Link to={`/${PROPOSE_NEW_MILESTONES_PATH}/${contractId}`} target="_blank">
                    <Button>Propose New Milestones</Button>
                  </Link>
                  <Stack alignItems={"flex-end"}>
                    <Button variant="outlined" color="error" onClick={() => setOpenEndContract(true)}>
                      End Contract
                    </Button>
                  </Stack>
                </>
              )}
            </Stack>
          </CustomContainer>
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
          <EndContractDialog
            open={openEndContract}
            handleClose={() => setOpenEndContract(false)}
            milestones={milestones}
            contractId={contractId}
            chatRoomId={contractData.chatRoomId}
            otherUserData={otherUserData}
            contractData={contractData}
          />
        </>
      ) : (
        <>
          {/* skeleton */}
          <ViewContractSkeleton />
        </>
      )}
    </>
  );
}

export default ViewContract;
