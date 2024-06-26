import { Paper, SxProps } from "@mui/material";
import { ReactNode } from "react";
import { useThemeContext } from "../../Contexts/Theming/ThemeContext";

export interface CustomPaperProps {
  sx?: SxProps;
  children?: ReactNode;
  messagePaper?: boolean;
  grayVariant?: boolean;
}

const CustomPaper: React.FC<CustomPaperProps> = ({ sx = {}, children, messagePaper, grayVariant }) => {
  const { themeColor } = useThemeContext();

  // Determine the variant of the paper
  const variant = messagePaper && themeColor !== "dark" ? "outlined" : undefined;

  // Assign a default elevation and modify based on props and themeColor
  const elevation = variant === "outlined" ? 0 : (messagePaper || grayVariant) && themeColor === "dark" ? 4 : 1;

  // Extend the sx prop based on conditions
  const extendedSx: SxProps = {
    ...(grayVariant && themeColor !== "dark" && { backgroundColor: "#f6f6f6" }),
    boxShadow: "none", // Remove boxShadow if elevation is 0
    ...sx,
  };

  return (
    <Paper sx={extendedSx} elevation={elevation} variant={variant}>
      {children}
    </Paper>
  );
};

export default CustomPaper;
