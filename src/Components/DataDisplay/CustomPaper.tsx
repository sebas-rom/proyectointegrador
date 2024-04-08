import { Paper, SxProps } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { useThemeContext } from "../../Contexts/Theming/ThemeContext";
export interface CustomPaperProps {
  sx?: SxProps;
  children?: ReactNode;
  component?: string;
}
const CustomPaper: React.FC<CustomPaperProps> = ({ sx = {}, children }) => {
  const { themeColor } = useThemeContext(); // Access themeColor from the context
  const [elevation, setElevation] = useState(0);
  useEffect(() => {
    setElevation(themeColor === "dark" ? 1 : 0);
  }, [themeColor]);

  return (
    <Paper sx={sx} elevation={elevation}>
      {children}
    </Paper>
  );
};

export default CustomPaper;
