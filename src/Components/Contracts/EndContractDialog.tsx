import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ContractData, MilestoneData } from "../../Contexts/Session/Firebase";
import { use } from "i18next";
import { set } from "date-fns";

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
  /** The contract data */
  contractData: ContractData;
}

const EndContractDialog: React.FC<CheckoutProps> = ({
  open,
  handleClose,
  milestones,
  contractId,
  chatRoomId,
  contractData,
}) => {
  const [hasMiletonesPending, setHasMilestonesPending] = useState(false);
  const [hasMilestonesSubmitted, setHasMilestonesSubmitted] = useState(false);
  const [hasMilestonesRevision, setHasMilestonesRevision] = useState(false);
  useEffect(() => {
    console.log(contractData);
    console.log(milestones);
    for (const milestone of milestones) {
      if (milestone.status === "pending") {
        setHasMilestonesPending(true);
      }
      if (milestone.status === "revision") {
        setHasMilestonesRevision(true);
      }
      if (milestone.status === "submitted") {
        setHasMilestonesSubmitted(true);
      }
    }
  }, [contractData]);
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={"sm"}>
      <DialogTitle>End Contract</DialogTitle>
      <DialogContent dividers>
        {!hasMiletonesPending && !hasMilestonesRevision && !hasMilestonesSubmitted ? (
          <></>
        ) : (
          <Stack>
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
  );
};

export default EndContractDialog;
