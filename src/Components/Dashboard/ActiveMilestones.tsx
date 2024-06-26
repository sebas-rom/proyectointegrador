import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import BorderText from "../CustomMUI/BorderText";
import { MilestoneData, getAllContracts, getContractData } from "../../Contexts/Session/Firebase";
import { Link } from "react-router-dom";
import { VIEW_CONTRACT_PATH } from "../Routes/routes";

function ActiveMilestones() {
  const [allMilestones, setAllMilestones] = useState<MilestoneData[]>([]);
  //   const [allContracts, setAllContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;

  /**
   * Fetches contract data from Firestore based on contractId.
   * Updates state variables accordingly.
   */
  useEffect(() => {
    setLoading(true);

    const getContract = async () => {
      setAllMilestones([]);
      const tempMilestones = [];
      const allContracts = await getAllContracts();
      for (const contract of allContracts) {
        if (contract.status != "ended") {
          const contractMilestoneData = await getContractData(contract.id);
          if (contractMilestoneData[0]) {
            if (contractMilestoneData[1] != null) {
              const tempActiveMilestones = [];
              for (const milestone of contractMilestoneData[1] as MilestoneData[]) {
                if (milestone.status != "paid") {
                  milestone.contractId = contract.id;
                  tempActiveMilestones.push(milestone);
                }
              }
              tempMilestones.push(...tempActiveMilestones);
            }
          }
        }
      }
      // Sort milestones by due date in ascending order
      const sortedMilestones = tempMilestones.sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return dateA - dateB;
      });
      setAllMilestones(sortedMilestones);
      setLoading(false);
    };

    getContract();
  }, []);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const visibleRows = React.useMemo(
    () => allMilestones.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [allMilestones, page, rowsPerPage]
  );

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
          {loading ? (
            <>
              {Array.from({ length: rowsPerPage }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography>
                      <Skeleton width={"100%"} />
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      <Skeleton width={"100%"} />
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      <Skeleton width={"100%"} />
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography>
                      <Skeleton width={"100%"} />
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : (
            <>
              {visibleRows.map((milestone, index) => (
                <TableRow key={index} hover>
                  <TableCell component="th" scope="row" align="center">
                    <Link
                      to={`/${VIEW_CONTRACT_PATH}/${milestone?.contractId}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                      }}
                      target="_blank"
                    >
                      <Typography sx={{ ":hover": { textDecoration: "underline" } }}>{milestone?.title}</Typography>
                    </Link>
                  </TableCell>
                  <TableCell align="center">
                    <Typography> ${milestone?.amount}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography>{milestone?.dueDate}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    {milestone?.status === "pending" && (
                      <>
                        {milestone?.onEscrow ? (
                          <BorderText color="warning" text="Pending" />
                        ) : (
                          <BorderText color="error" text="Not Funded" />
                        )}
                      </>
                    )}
                    {milestone?.status === "paid" && <BorderText color="success" text="Paid" />}
                    {milestone?.status === "revision" && <BorderText color="info" text="In revision" />}
                    {milestone?.status === "submitted" && <BorderText color="info" text="Submitted" />}
                    {milestone?.status === "refunded" && <BorderText color="error" text="Refunded" />}
                  </TableCell>
                </TableRow>
              ))}
              {Array.from({ length: Math.max(0, rowsPerPage - visibleRows.length) }).map((_, index) => (
                <TableRow key={`empty-${index}`}>
                  <TableCell colSpan={4}>
                    <Typography sx={{ color: "transparent" }}>-</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[]}
              count={allMilestones.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}

export default ActiveMilestones;
