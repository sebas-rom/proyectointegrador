import React, { useState, useRef, useEffect } from "react";
import { Typography, Button } from "@mui/material";

const MAX_HEIGHT = 190; // The maximum height of the content before "Show More" appears

function AboutSection({ children }) {
  const [expanded, setExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      setShowMoreButton(contentRef.current.clientHeight >= MAX_HEIGHT);
    }
  }, [children]); // Check if show more button is needed when userData changes

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div>
      <div
        ref={contentRef}
        style={{
          maxHeight: expanded ? "none" : MAX_HEIGHT + "px",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
      {showMoreButton && (
        <>
          <Button onClick={toggleExpanded}>{expanded ? "Show Less" : "Show More"}</Button>
        </>
      )}
    </div>
  );
}

export default AboutSection;
