import React, { ReactNode, CSSProperties } from "react";
import { Button, ButtonProps, SxProps, Theme } from "@mui/material";

interface CustomIconButtonProps extends ButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  customSx?: SxProps<Theme>;
}

function CustomIconButton({ children, onClick, customSx, ...buttonProps }: CustomIconButtonProps) {
  return (
    <Button
      variant="outlined"
      color="primary"
      onClick={onClick}
      sx={{
        borderRadius: "50%",
        maxHeight: "35px",
        maxWidth: "35px",
        minHeight: "35px",
        minWidth: "35px",
        ...customSx,
      }}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}

export default CustomIconButton;
