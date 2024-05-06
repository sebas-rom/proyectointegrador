import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import BorderText from "../CustomMUI/BorderText";
import { MilestoneData, getContractData } from "../../Contexts/Session/Firebase";

function ActiveMilestones() {
  const [oldMilestones, setOldMilestones] = useState<MilestoneData[]>([]);
  const [loading, setLoading] = useState(true);
  /**
   * Fetches contract data from Firestore based on contractId.
   * Updates state variables accordingly.
   */
  useEffect(() => {
    setLoading(true);
    const getContract = async () => {
      const contractMilestoneData = await getContractData("nX83RP8ILWdxez3q22OD");
      if (contractMilestoneData[0]) {
        if (contractMilestoneData[1] != null) {
          const tempOldMilestones = [];
          const tempNewMilestones = [];
          for (const milestone of contractMilestoneData[1]) {
            if (milestone.status === "proposed") {
              tempNewMilestones.push(milestone);
            } else {
              tempOldMilestones.push(milestone);
            }
          }
          setOldMilestones(tempOldMilestones);
        }
      }
      setLoading(false);
    };
    getContract();
  }, []);
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center">Milestone</TableCell>
            <TableCell align="center">Ammount</TableCell>
            <TableCell align="center">Due Date</TableCell>
            <TableCell align="center">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {oldMilestones.map((milestone, index) => (
            <TableRow key={index}>
              <TableCell component="th" scope="row" align="center">
                <Typography>{milestone?.title}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography> ${milestone?.amount}</Typography>
              </TableCell>
              <TableCell align="center">
                <Typography>{milestone?.dueDate}</Typography>
              </TableCell>
              <TableCell align="center">
                {milestone?.status === "pending" && <BorderText color="warning" text="Pending" />}
                {milestone?.status === "paid" && <BorderText color="success" text="Paid" />}
                {milestone?.status === "revision" && <BorderText color="info" text="In revision" />}
                {milestone?.status === "submitted" && <BorderText color="info" text="Submitted" />}
                {milestone?.status === "refunded" && <BorderText color="error" text="Refunded" />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ActiveMilestones;
