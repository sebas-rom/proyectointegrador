import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFeedback } from "../../../Contexts/Feedback/FeedbackContext";
import { doc, onSnapshot } from "firebase/firestore";
import {
  CONTRACTS_COLLECTION,
  ContractData,
  db,
} from "../../../Contexts/Session/Firebase";

function ViewContract() {
  const navigate = useNavigate();
  const { contractId } = useParams();
  const { setLoading } = useFeedback();
  const [contractData, setContractData] = useState<ContractData | null>(null);

  useEffect(() => {
    setLoading(true);
    let unsubscribe;
    // Fetch contract details
    const fetchDataAndListen = async () => {
      unsubscribe = onSnapshot(
        doc(db, CONTRACTS_COLLECTION, contractId),
        (doc) => {
          const tempData = doc.data() as ContractData;
          setContractData(tempData);
          console.log("Current data: ", tempData);
        }
      );
    };
    fetchDataAndListen();
    setLoading(false);
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);
  return <div>ViewContract sumbit milestones , send refund, etc</div>;
}

export default ViewContract;
