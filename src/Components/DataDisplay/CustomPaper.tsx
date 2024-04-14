import { Paper, SxProps } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useThemeContext } from "../../Contexts/Theming/ThemeContext";
export interface CustomPaperProps {
  sx?: SxProps;
  children?: ReactNode;
  component?: string;
  messagePaper?: boolean;
}
const CustomPaper: React.FC<CustomPaperProps> = ({ sx = {}, children, messagePaper }) => {
  const { themeColor } = useThemeContext(); // Access themeColor from the context
  const [elevation, setElevation] = useState(0);
  useEffect(() => {
    if (messagePaper) {
      setElevation(themeColor === "dark" ? 3 : 0);
    } else {
      setElevation(themeColor === "dark" ? 1 : 0);
    }
  }, [themeColor]);

  // Check if messagePaper is true and theme color is not dark
  const outlinedVariant = messagePaper && themeColor !== "dark" ? "outlined" : undefined;

  return (
    //  if messagePaper and not dark add: variant="outlined"
    <Paper sx={sx} elevation={elevation} variant={outlinedVariant}>
      {children}
    </Paper>
  );
};

export default CustomPaper;
