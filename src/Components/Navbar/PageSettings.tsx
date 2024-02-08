import { Stack, Typography } from "@mui/material";
import ChooseLang from "./ChooseLang.tsx";
import ChooseTheme from "./ChooseTheme.tsx";
import "./navbar.css";
import ShowAccount from "./ShowAccount.tsx";

function PageSettings(props?: any) {
  return (
    <Stack justifyContent="space-between" style={{ height: "100%" }}>
      <div>
        <ShowAccount />
        {props.children}
      </div>

      <Stack>
        <Typography variant="subtitle1">Language</Typography>
        <ChooseLang />

        <Typography variant="subtitle1">Color Mode</Typography>
        <ChooseTheme />
      </Stack>
    </Stack>
  );
}

export default PageSettings;
