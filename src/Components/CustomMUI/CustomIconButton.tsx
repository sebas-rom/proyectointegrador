import React from "react";
import { Button, ButtonProps, SxProps, Theme } from "@mui/material";

interface CustomIconButtonProps extends ButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  customSx?: SxProps<Theme>;
}

// Ref is added as part of the arguments
const CustomIconButton = React.forwardRef<HTMLButtonElement, CustomIconButtonProps>(
  ({ children, onClick, customSx, ...buttonProps }, ref) => {
    return (
      <Button
        variant="outlined"
        color="primary"
        onClick={onClick}
        sx={{
          borderRadius: "50%",
          maxHeight: "32px",
          maxWidth: "32px",
          minHeight: "32px",
          minWidth: "32px",
          ...customSx,
        }}
        ref={ref} // We pass ref to the Button component
        {...buttonProps}
      >
        {children}
      </Button>
    );
  }
);

export default CustomIconButton;
