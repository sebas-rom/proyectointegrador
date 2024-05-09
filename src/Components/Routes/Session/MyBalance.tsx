import React, { useEffect, useState } from "react";
import CustomContainer from "../../CustomMUI/CustomContainer";
import { Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import {
  BALANCE_COLLECTION,
  TransactionData,
  auth,
  db,
  getAllOfMyTransactions,
} from "../../../Contexts/Session/Firebase";
import { format } from "date-fns";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

function MyBalance() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  useEffect(() => {
    setLoading(true);
    async function fetch() {
      const balanceRef = doc(db, BALANCE_COLLECTION, auth.currentUser.uid);
      const balanceSnapshot = await getDoc(balanceRef);
      setBalance(balanceSnapshot.data().balance);
      const transactions = await getAllOfMyTransactions();
      setTransactions(transactions);
      setLoading(false);
    }
    fetch();
  }, []);

  const formatDate = (seconds) => {
    const date = new Date(seconds * 1000);
    return format(date, "d/M/yy"); // Month and day (e.g., 4/8)
  };
  return (
    <CustomContainer>
      <Stack>
        <Typography variant="h5">Balance</Typography>
        <Typography variant="body1">Your current balance is: ${balance}</Typography>
        <Typography variant="h5">Transactions</Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center"></TableCell>
                <TableCell align="center">Ammount</TableCell>
                <TableCell align="center">Date</TableCell>
                <TableCell align="center">Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row" align="center">
                    {transaction.amount >= 0 ? (
                      <ArrowDropUpIcon color="primary" />
                    ) : (
                      <ArrowDropDownIcon color="error" />
                    )}
                  </TableCell>
                  <TableCell align="center">${transaction.amount}</TableCell>
                  <TableCell align="center">{formatDate(transaction.createdAt.seconds)}</TableCell>
                  <TableCell align="center">{transaction.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </CustomContainer>
  );
}

export default MyBalance;
