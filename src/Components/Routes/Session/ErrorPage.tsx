// ErrorPage.js or ErrorPage.tsx if you are using TypeScript
import React from "react";
import CustomContainer from "../../CustomMUI/CustomContainer";
import { Button, Stack, Typography } from "@mui/material";
import errorPage from "../../../assets/svg/error-page.svg";
import { useNavigate } from "react-router-dom";
import { DASHBOARD_PATH } from "../routes";
function ErrorPage() {
  const navigate = useNavigate();
  const reloadPage = () => {
    window.location.reload();
  };
  const goToDashboard = () => {
    navigate(`/${DASHBOARD_PATH}`);
  };

  return (
    <CustomContainer>
      <Stack sx={{ minHeight: "50vh" }} justifyContent={"space-around"} alignItems={"center"}>
        <Typography variant="h4">Oops! Something went wrong.</Typography>
        <img
          src={errorPage}
          style={{
            maxHeight: 500,
          }}
        />
        <Stack direction="row" spacing={2} width={"100%"} justifyContent={"center"}>
          <Button onClick={reloadPage} variant="contained">
            Reload
          </Button>
          <Button onClick={goToDashboard} variant="outlined">
            Go to dashboard
          </Button>
        </Stack>
      </Stack>
    </CustomContainer>
  );
}

export default ErrorPage;
