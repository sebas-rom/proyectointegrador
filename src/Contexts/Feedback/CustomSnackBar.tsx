import * as React from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

//text and severity as props
export default function CustomSnackBar() {
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const closeSnackBar = (
    //@ts-expect-error
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  return (
    <Snackbar
      open={openSnackbar}
      autoHideDuration={5000}
      onClose={closeSnackBar}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={closeSnackBar}
        severity="success"
        variant="filled"
        sx={{ width: "100%" }}
      >
        This is a success Alert inside a Snackbar!
      </Alert>
    </Snackbar>
  );
}
