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
  const [collapsedHeight, setCollapsedHeight] = useState("0px");
  const textRef = useRef(null);

  const checkTruncation = () => {
    if (textRef.current) {
      const { scrollHeight } = textRef.current;
      const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight, 10);
      const lines = scrollHeight / lineHeight;
      setIsTruncatable(lines > maxLines);

      // Set the collapsedHeight state
      const maxHeight = lineHeight * maxLines;
      setCollapsedHeight(`${Math.min(scrollHeight, maxHeight)}px`);
    }
  };

  const debouncedCheckTruncation = debounce(checkTruncation, 200);

  useEffect(() => {
    debouncedCheckTruncation();
    window.addEventListener("resize", debouncedCheckTruncation);
    return () => window.removeEventListener("resize", debouncedCheckTruncation);
  }, [maxLines, debouncedCheckTruncation]);

  useEffect(() => {
    checkTruncation();
  }, [children, maxLines]);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div>
      <Collapse in={!isCollapsed} collapsedSize={collapsedHeight}>
        <Typography ref={textRef} component="div" style={{ whiteSpace: "pre-line" }}>
          {children}
        </Typography>
      </Collapse>
      {isTruncatable && (
        <Button onClick={handleToggle} size="small">
          {isCollapsed ? "Show More" : "Show Less"}
        </Button>
      )}
    </div>
  );
};

export default CollapsibleText;
