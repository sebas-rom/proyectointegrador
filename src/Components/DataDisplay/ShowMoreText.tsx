import { useState, useRef, useEffect } from "react";
import { Button } from "@mui/material";

const MAX_HEIGHT = 190; // The maximum height of the content before "Show More" appears

function AboutSection({ children }) {
  const [expanded, setExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      setShowMoreButton(contentRef.current.clientHeight >= MAX_HEIGHT);
    }
  }, [children]); // Check if show more button is needed when kids change

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const contentStyle = {
    maxHeight: expanded ? `${contentRef.current.scrollHeight}px` : `${MAX_HEIGHT}px`,
    overflow: "hidden",
    transition: "max-height 0.5s ease-in-out",
    ...(showMoreButton && { cursor: "pointer" }), // Optional: change cursor
  };

  return (
    <div>
      <div ref={contentRef} style={contentStyle}>
        {children}
      </div>
      {showMoreButton && <Button onClick={toggleExpanded}>{expanded ? "Show Less" : "Show More"}</Button>}
    </div>
  );
}

export default AboutSection;