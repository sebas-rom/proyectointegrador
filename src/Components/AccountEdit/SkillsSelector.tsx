import { useState } from "react";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { Box, Paper, Typography } from "@mui/material";

function SkillsSelector({ skills, setSkills }) {
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const newSkill = inputValue.trim();
      if (newSkill && skills.length < 10) {
        setSkills((prevSkills) => [...prevSkills, newSkill]);
        setInputValue("");
        setErrorMessage("");
      } else {
        setErrorMessage("Maximum of 10 skills allowed.");
      }
    }
  };

  const handleChipDelete = (skillToDelete) => () => {
    setSkills((prevSkills) => prevSkills.filter((skill) => skill !== skillToDelete));
    setErrorMessage("");
  };

  return (
    <Box width={"100%"} minHeight={1}>
      <Typography variant="h6">My Skills</Typography>
      <Paper variant="outlined" sx={{ boxShadow: 0, backgroundColor: "transparent", padding: 1 }}>
        <TextField
          variant="standard"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          autoComplete="off"
          placeholder="Enter a skill and press Enter or type a comma"
          fullWidth
        />

        {skills.map((skill, index) => (
          <Chip key={index} label={skill} onDelete={handleChipDelete(skill)} style={{ margin: 2, marginTop: 10 }} />
        ))}
      </Paper>
      {errorMessage && (
        <Typography variant="body2" color="error" style={{ marginTop: 8 }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
}

export default SkillsSelector;
