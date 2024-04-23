import React, { useState, useRef, useEffect } from "react";
import { Collapse, Typography, Button } from "@mui/material";

const debounce = (func, wait) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const CollapsibleText = ({ children, maxLines = 3 }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isTruncatable, setIsTruncatable] = useState(false);
  const textRef = useRef(null);

  const checkTruncation = () => {
    if (textRef.current) {
      const { scrollHeight } = textRef.current;
      const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight, 10);
      const lines = scrollHeight / lineHeight;
      setIsTruncatable(lines > maxLines);
    }
  };

  const debouncedCheckTruncation = debounce(checkTruncation, 200);

  useEffect(() => {
    debouncedCheckTruncation();
    window.addEventListener("resize", debouncedCheckTruncation);
    return () => window.removeEventListener("resize", debouncedCheckTruncation);
  }, [maxLines]);

  useEffect(() => {
    checkTruncation();
  }, [children]);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div>
      <Collapse in={!isCollapsed} collapsedSize={`${maxLines * 1.5}em`}>
        <Typography ref={textRef} component="div" style={{ whiteSpace: "pre-line" }}>
          {children}
        </Typography>
      </Collapse>
      {isTruncatable && <Button onClick={handleToggle}>{isCollapsed ? "Show More" : "Show Less"}</Button>}
    </div>
  );
};

export default CollapsibleText;
