import { Typography } from "@mui/material";
import ChooseLang from "./ChooseLang.tsx";
import ChooseTheme from "./ChooseTheme.tsx";
import "./navbar.css";
import ShowAccount from "./ShowAccount.tsx";

function PageSettings() {
  return (
    <>
      <ShowAccount />

      <Typography variant="subtitle1">Language</Typography>
      <ChooseLang />

      <Typography variant="subtitle1">Color Mode</Typography>
      <ChooseTheme />
    </>
  );
}

export default PageSettings;
