import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useFeedback } from "../../Contexts/Feedback/FeedbackContext";
import { useState } from "react";
import {
  ContractData,
  MilestoneData,
  db,
} from "../../Contexts/Session/Firebase";
import { doc, updateDoc } from "firebase/firestore";
import { set } from "date-fns";

/**
 * Interface for Message component props
 */
export interface CheckoutProps {
  open: boolean; // State to control the dialog open/close
  handleClose: () => void; // Function to handle dialog close
  milestone: MilestoneData;
  contractId: string;
}

const Checkout: React.FC<CheckoutProps> = ({
  open,
  handleClose,
  milestone,
  contractId,
}) => {
  const { setLoading, showSnackbar } = useFeedback();
  const [{ options, isPending }, dispatch] = usePayPalScriptReducer();
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
        return orderId; // Return the order ID
      })
      .catch((error) => {
        // console.error("Error creating order:", error); // Log any errors
        showSnackbar("There was an error processing your order", "error");
        throw error; // Throw the error to be caught in the UI
      })
      .finally(() => {
        setLoading(false); // Set loading back to false when order creation ends
      });
  };

  const onApproveOrder = (data, actions) => {
    setLoading(true); // Set loading to true when payment process starts
    return actions.order
      .capture()
      .then(async () => {
        const milestoneRef = doc(
          db,
          `contracts/${contractId}/milestones/${milestone.id}`
        );
        await updateDoc(milestoneRef, {
          onEscrow: true,
        });
        showSnackbar("Payment completed", "success");
      })
      .catch((error) => {
        showSnackbar("There was an error processing your order", "error");
        throw error; // Throw the error to be caught in the UI
      })
      .finally(() => {
        setLoading(false); // Set loading back to false when payment process ends
        handleClose(); // Close the dialog
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
              sx={{ width: "100%" }}
            >
              <Typography variant="h6">
                Total: ${milestone.amount.toFixed(2)}
              </Typography>
              <Stack sx={{ width: "70%", maxWidth: "400px" }}>
                <PayPalButtons
                  style={{ layout: "vertical" }}
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
              style={{ marginTop: "10px" }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default Checkout;
