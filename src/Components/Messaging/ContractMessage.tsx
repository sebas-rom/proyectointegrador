import { useEffect, useState } from "react";
import {
  ContractData,
  UserData,
  auth,
  getContractData,
  getUserData,
} from "../../Contexts/Session/Firebase";
import { Button, Paper, Skeleton, Stack, Typography } from "@mui/material";
import { format } from "date-fns";

export interface ContractMessageProps {
  createdAt?: { seconds: number } | null;
  contractId?: string;
}

const AuxTypography = ({ text1, text2 }) => {
  return (
    <Typography display="inline">
      <Typography color="textSecondary" component="span">
        <i>{text1}</i>
      </Typography>
      {text2 ? text2 : "N/A"}
    </Typography>
  );
};

const ContactMessageSkeleton = () => {
  return (
    <Stack alignItems={"center"} spacing={2}>
      <Typography color="textSecondary">
        <Skeleton width={150} />
      </Typography>
      <Stack direction="column" spacing={1}>
        <Typography>
          <Skeleton width={100} />
        </Typography>
        <Typography>
          <Skeleton width={75} />
        </Typography>
        <Typography>
          <Skeleton width={40} />
        </Typography>
      </Stack>
      <Button disabled>
        <Skeleton width={40} />
      </Button>
      <Typography variant="body2" color="textSecondary" fontSize={11}>
        <Skeleton width={25} />
      </Typography>
    </Stack>
  );
};
const ContractMessage: React.FC<ContractMessageProps> = ({
  createdAt = null,
  contractId = "",
}) => {
  const [loading, setLoading] = useState(true);
  const [contractData, setContractData] = useState<ContractData>();
  const [userData, setUserData] = useState<UserData>();
  const [isOwnMessage, setIsOwnMessage] = useState(false);
  useEffect(() => {
    const fetch = async () => {
      const contractData = await getContractData(contractId);
      setContractData(contractData[0]);
      if (contractData[0].proposedBy === auth.currentUser.uid) {
        setIsOwnMessage(true);
      }
      if (contractData[0].proposedBy) {
        const userData = await getUserData(contractData[0].proposedBy);
        setUserData(userData);
      }
      setLoading(false);
    };
    fetch();
  }, [contractId]);

  const [formattedDate, setFormattedDate] = useState(null);
  useEffect(() => {
    setFormattedDate(
      format(
        createdAt?.seconds ? new Date(createdAt.seconds * 1000) : null,
        "h:mm a"
      )
    );
  }, []);
  return (
    <Stack alignItems={"center"} marginBottom={1}>
      <Paper
        sx={{ width: { xs: "90%", sm: "60%", md: "40%" }, padding: "20px" }}
      >
        {!loading ? (
          <Stack alignItems={"center"} spacing={2}>
            <Typography color="textSecondary">
              {userData.firstName} Sent a Contract Proposal
            </Typography>
            <Stack direction="column" spacing={1}>
              <AuxTypography text1="Title: " text2={contractData?.title} />
              <AuxTypography
                text1="Description: "
                text2={contractData?.description}
              />
              <AuxTypography
                text1="Budget: "
                text2={contractData?.totalAmount}
              />
            </Stack>

            {!isOwnMessage && <Button variant="outlined">View Contract</Button>}
            <Typography variant="body2" color="textSecondary" fontSize={11}>
              {formattedDate ? formattedDate : "h:mm a"}
            </Typography>
          </Stack>
        ) : (
          <ContactMessageSkeleton />
        )}
      </Paper>
    </Stack>
  );
};

export default ContractMessage;
