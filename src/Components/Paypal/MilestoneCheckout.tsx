import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useFeedback } from "../../Contexts/Feedback/FeedbackContext";
import {
  ContractUpdateMetadata,
  MilestoneData,
  UserData,
  auth,
  db,
  getUserData,
  sendMessageToChat,
} from "../../Contexts/Session/Firebase";
import { doc, updateDoc } from "firebase/firestore";

/**
 * Interface for Checkout component props
 */
export interface CheckoutProps {
  /** State to control the dialog open/close */
  open: boolean;
  /** Function to handle dialog close */
  handleClose: () => void;
  /** The milestone data to be paid for */
  milestone: MilestoneData;
  /** The unique identifier of the contract */
  contractId: string;
  /** The unique identifier of the chat room */
  chatRoomId: string;
}

/**
 * Checkout component that provides a dialog for completing payments via PayPal.
 * @param {CheckoutProps} props - The props for the Checkout component.
 * @returns {JSX.Element} - The Checkout component UI.
 * @component
 */
const MilestoneCheckout: React.FC<CheckoutProps> = ({ open, handleClose, milestone, contractId, chatRoomId }) => {
  const { setLoading, showSnackbar } = useFeedback();
  const [{ isPending }] = usePayPalScriptReducer();

  /**
   * Creates a PayPal order for the milestone payment.
   * @param {Object} data - Data from the PayPal buttons component
   * @param {Object} actions - Actions provided by the PayPal buttons component
   * @returns {Promise<string>} - A promise that resolves to the created order ID
   */
  //@ts-expect-error ignored data parameter
  const onCreateOrder = (data, actions) => {
    // console.log("Creating order...");
    setLoading(true); // Set loading to true when order creation starts
    return actions.order
      .create({
        purchase_units: [
          {
            amount: {
              value: milestone.amount.toFixed(2),
            },
          },
        ],
      })
      .then((orderId) => {
        // console.log("Order created:", orderId); // Log the created order ID
        setLoading(false);
        return orderId; // Return the order ID
      })
      .catch((error) => {
        // console.error("Error creating order:", error); // Log any errors
        showSnackbar("There was an error processing your order", "error");
        setLoading(false);
        throw error; // Throw the error to be caught in the UI
      });
  };

  /**
   * Captures the payment for the milestone.
   * Updates the milestone status in the database upon successful payment.
   * @param {Object} data - Data from the PayPal buttons component
   * @param {Object} actions - Actions provided by the PayPal buttons component
   */
  //@ts-expect-error ignored data parameter
  const onApproveOrder = (data, actions) => {
    setLoading(true); // Set loading to true when payment process starts
    return actions.order
      .capture()
      .then(async () => {
        const milestoneRef = doc(db, `contracts/${contractId}/milestones/${milestone.id}`);
        await updateDoc(milestoneRef, {
          onEscrow: true,
        });
        const currentUserData = (await getUserData(auth.currentUser.uid)) as UserData;
        const statusText = currentUserData.firstName + " funded the milestone: " + milestone.title;
        const contractUpdateMetadata: ContractUpdateMetadata = {
          contractId,
          milestoneId: milestone.id,
          milestoneTitle: milestone.title,
          milestoneAmount: milestone.amount,
          type: "milestone-funded",
        };
        await sendMessageToChat(chatRoomId, statusText, "contract-update", {}, contractUpdateMetadata); /////////////////////////
        showSnackbar("Payment completed", "success");
        setLoading(false);
        handleClose(); // Close the dialog
      })
      .catch((error) => {
        setLoading(false);
        showSnackbar("There was an error processing your order", "error");
        throw error; // Throw the error to be caught in the UI
      });
  };

  return (
    <>
      {isPending ? (
        <p>LOADING...</p>
      ) : (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth={"sm"}>
          <DialogTitle>Checkout</DialogTitle>
          <DialogContent dividers>
            <Stack
              spacing={2}
              alignContent={"center"}
              justifyContent={"center"}
              alignItems={"center"}
              sx={{
                width: "100%",
              }}
            >
              <Typography variant="h6">Total: ${milestone.amount.toFixed(2)}</Typography>
              <Stack
                sx={{
                  width: "70%",
                  maxWidth: "400px",
                }}
              >
                <PayPalButtons
                  style={{
                    layout: "vertical",
                  }}
                  createOrder={(data, actions) => onCreateOrder(data, actions)}
                  onApprove={(data, actions) => onApproveOrder(data, actions)}
                />
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClose}
              style={{
                marginTop: "10px",
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default MilestoneCheckout;
