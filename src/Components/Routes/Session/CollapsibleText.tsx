import { useState, useRef, useEffect } from "react";
import { Typography, Button } from "@mui/material";

// Utility function to debounce another function
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

  // Function to calculate and set truncation based on clientHeight and scrollHeight
  const checkTruncation = () => {
    const { scrollHeight, clientHeight } = textRef.current;
    const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight, 10);
    const lines = scrollHeight / lineHeight;
    setIsTruncatable(lines > maxLines);
  };

  // Debounced version of checkTruncation for better performance
  const debouncedCheckTruncation = debounce(checkTruncation, 200);

  useEffect(() => {
    // Run initially and whenever there's a resize event
    debouncedCheckTruncation();
    window.addEventListener("resize", debouncedCheckTruncation);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener("resize", debouncedCheckTruncation);
    };
  }, [maxLines, debouncedCheckTruncation]);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div>
      <Typography
        ref={textRef}
        whiteSpace="pre-line"
        style={{
          overflow: isCollapsed ? "hidden" : "visible",
          WebkitLineClamp: isCollapsed ? maxLines : "none",
          WebkitBoxOrient: "vertical",
          textOverflow: "ellipsis",
          height: isCollapsed ? `${maxLines * 1.5}em` : "auto",
        }}
      >
        {children}
      </Typography>
      {isTruncatable && <Button onClick={handleToggle}>{isCollapsed ? "Show More" : "Show Less"}</Button>}
    </div>
  );
};

export default CollapsibleText;
