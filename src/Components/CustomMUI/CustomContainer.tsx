import { Container, SxProps } from "@mui/material";
import { ReactNode } from "react";
import CustomPaper from "./CustomPaper";

export interface CustomContainerProps {
  sx?: SxProps;
  children?: ReactNode;
}

const CustomContainer: React.FC<CustomContainerProps> = ({ sx = {}, children }) => {
  // Extend the sx prop based on conditions
  const extendedSx: SxProps = {
    paddingLeft: "10px",
    paddingRight: "10px",
    paddingTop: "10px",
    ...sx,
  };
  return (
    <Container sx={extendedSx} maxWidth="lg" disableGutters>
      <CustomPaper
        sx={{
          padding: { lg: 4, md: 3, sm: 2, xs: 1 },
        }}
      >
        {children}
      </CustomPaper>
    </Container>
  );
};

export default CustomContainer;
