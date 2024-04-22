import React, { useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CustomPaper from "../CustomMUI/CustomPaper";
import CollapsibleText from "../Routes/Session/CollapsibleText";
import { Collapse } from "@mui/material";
const ShowExperiences = ({ userData }) => {
  const [showAll, setShowAll] = useState(false);

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <Stack spacing={2}>
      {userData.experiences.map((experience, index) => (
        <>
          {index < 3 && (
            <CustomPaper key={index} messagePaper sx={{ padding: 1 }}>
              <Typography variant="h6">{experience.subject}</Typography>
              <CollapsibleText>{experience.description}</CollapsibleText>
            </CustomPaper>
          )}
        </>
      ))}
      {userData?.experiences.length > 3 && (
        <>
          {userData.experiences.map((experience, index) => (
            <>
              {index >= 3 && (
                <Collapse in={showAll}>
                  <CustomPaper key={index} messagePaper sx={{ padding: 1 }}>
                    <Typography variant="h6">{experience.subject}</Typography>
                    <CollapsibleText>{experience.description}</CollapsibleText>
                  </CustomPaper>
                </Collapse>
              )}
            </>
          ))}
          <Stack alignItems={"center"}>
            <Button onClick={toggleShowAll}>
              {!showAll ? `Show more(${userData.experiences.length - 3})` : `Show Less `}
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default ShowExperiences;
