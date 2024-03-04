// import React from "react";
import { Button, Stack, Typography } from "@mui/material";
import error404 from "../../assets/svg/404.svg";
import { useNavigate } from "react-router-dom";

function PageNotFound() {
  const navigate = useNavigate();
  return (
    <Stack spacing={3} justifyContent={"center"} alignItems={"center"}>
      <Typography variant="h4" align="center" style={{ marginTop: "2rem" }}>
        Sorry, we couldn't find what you are looking for...
      </Typography>
      <Button variant="outlined" onClick={() => navigate("/")}>
        Go Home
      </Button>
      <img src={error404} style={{ width: "90%" }} />
    </Stack>
  );
}

export default PageNotFound;
