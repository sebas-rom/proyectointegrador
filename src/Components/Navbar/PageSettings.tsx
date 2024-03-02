import { Stack, Typography } from "@mui/material";
import ChooseLang from "./ChooseLang.tsx";
import ChooseTheme from "./ChooseTheme.tsx";
import "./navbar.css";
import ShowAccount from "./ShowAccount.tsx";
import { ReactNode } from "react";

/**
 * The PageSettings component serves as a layout container for user settings, including account information,
 * language selection, and theme choice. This component is designed to take up the full height of its container.
 *
 * @component
 * @param {ReactNode} children  - The props may include children components to be rendered within the account section.
 *
 * @example
 * <PageSettings>
 *   <ChildComponent />
 * </PageSettings>
 *
 * @returns {JSX.Element} The composed settings page structure.
 */
function PageSettings({ children }: { children: ReactNode }) {
  return (
    <Stack justifyContent="space-between" style={{ height: "100%" }}>
      <div>
        <ShowAccount />
        {children}
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
