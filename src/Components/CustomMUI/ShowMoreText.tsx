import { useState, useRef, useEffect } from "react";
import { Button } from "@mui/material";


function ShowMoreText({ maxHeight, children }) {
  const [expanded, setExpanded] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      setShowMoreButton(contentRef.current.clientHeight >= maxHeight);
    }
  }, [children]); // Check if show more button is needed when kids change

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const contentStyle = {
    maxHeight: expanded ? `${contentRef.current.scrollHeight}px` : `${maxHeight}px`,
    overflow: "hidden",
    transition: "max-height 0.5s ease-in-out",
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

export default ShowMoreText;
