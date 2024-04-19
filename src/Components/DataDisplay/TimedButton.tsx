import { useState, useEffect } from "react";
import { Button } from "@mui/material";

const TimedButton = ({ onClick, color, seconds, children }) => {
  const [disabled, setDisabled] = useState(false);
  const [countdown, setCountdown] = useState(seconds);

  useEffect(() => {
    let timer;

    if (disabled) {
      timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount > 1) return prevCount - 1;
          setDisabled(false);
          clearInterval(timer);
          return seconds; // Reset countdown
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [disabled, seconds]);

  const handleClick = () => {
    setDisabled(true);
    onClick();
  };

  return (
    <Button onClick={handleClick} color={color} disabled={disabled}>
      {disabled ? `${children} (${countdown} seconds)` : children}
    </Button>
  );
};

export default TimedButton;
