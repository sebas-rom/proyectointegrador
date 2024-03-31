import PropTypes from "prop-types";

// material-ui
import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

const BorderText = ({ color, text }) => {
  const theme = useTheme();
  let main;
  switch (color) {
    case "secondary":
      main = theme.palette.secondary.main;
      break;
    case "error":
      main = theme.palette.error.main;
      break;
    case "warning":
      main = theme.palette.warning.main;
      break;
    case "info":
      main = theme.palette.info.main;
      break;
    case "success":
      main = theme.palette.success.main;
      break;
    case "primary":
    default:
      main = theme.palette.primary.main;
  }

  return (
    <Box
      sx={{
        borderRadius: "5px",
        bgcolor: main,
        paddingLeft: 1,
        paddingRight: 1,
      }}
    >
      <Typography variant="body1" color={"white"}>
        {text}
      </Typography>
    </Box>
  );
};

BorderText.propTypes = {
  color: PropTypes.string,
  //   size: PropTypes.number,
  text: PropTypes.string,
};

export default BorderText;
