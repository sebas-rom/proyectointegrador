import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  DialogTitle,
  Typography,
  Stack,
  Tooltip,
  Divider,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CustomIconButton from "../CustomMUI/CustomIconButton";
import LimitedTextField from "../CustomMUI/LimitedTextField";

// Define the Experience interface including an id for key management
interface Experience {
  id: number;
  subject: string;
  description: string;
}

function AddExperiences() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<Experience>({ id: -1, subject: "", description: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const handleOpenDialog = (experience?: Experience) => {
    setEditMode(!!experience);
    setCurrentExperience(experience ?? { id: Date.now(), subject: "", description: "" });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleAddOrEditExperience = () => {
    if (editMode) {
      // Update the experience when in edit mode
      setExperiences(experiences.map((exp) => (exp.id === currentExperience.id ? currentExperience : exp)));
    } else {
      // Add a new experience only if the number of existing experiences is less than 10
      if (experiences.length < 10) {
        setExperiences([...experiences, currentExperience]);
        setErrorMessage("");
      } else {
        setErrorMessage("Maximum of 10 skills allowed.");
      }
    }
    handleCloseDialog();
  };

  const handleDeleteExperience = (id: number) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCurrentExperience({ ...currentExperience, [name]: value });
  };

  return (
    <>
      <Stack direction="row" justifyContent={"space-between"} alignItems={"center"}>
        <Typography variant="h6">My Experiences</Typography>
        <Tooltip title="Add experience">
          <CustomIconButton onClick={() => handleOpenDialog()}>
            <AddIcon fontSize="small" />
          </CustomIconButton>
        </Tooltip>
      </Stack>
      {errorMessage && (
        <Typography variant="body2" color="error" style={{ marginTop: 8 }}>
          {errorMessage}
        </Typography>
      )}

      <Paper variant="outlined" sx={{ boxShadow: 0, backgroundColor: "transparent", padding: 1 }}>
        {/* List of experiences with edit and delete options */}
        {experiences.map((experience, index) => (
          <div key={experience.id}>
            {index === 0 && <Divider flexItem sx={{ marginBottom: 2 }} />}
            <Stack direction="row" justifyContent={"space-between"} alignItems={"center"}>
              <Typography variant="h6">{experience.subject}</Typography>
              <Stack spacing={1}>
                <CustomIconButton onClick={() => handleOpenDialog(experience)}>
                  <EditIcon fontSize="small" />
                </CustomIconButton>
                <CustomIconButton onClick={() => handleDeleteExperience(experience.id)} color="error">
                  <DeleteIcon fontSize="small" />
                </CustomIconButton>
              </Stack>
            </Stack>
            <Typography whiteSpace={"pre-line"}>{experience.description}</Typography>
            <Divider flexItem sx={{ marginBottom: 2, marginTop: 2 }} />
          </div>
        ))}
        {experiences.length === 0 && <Typography>No experiences added yet.</Typography>}
      </Paper>
      {/* Dialog for adding or editing experience */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editMode ? "Edit Experience" : "Add New Experience"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            autoComplete="off"
            margin="dense"
            name="subject"
            label="Subject"
            type="text"
            fullWidth
            value={currentExperience.subject}
            onChange={handleInputChange}
          />
          <LimitedTextField
            maxLength={500}
            autoComplete="off"
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={currentExperience.description}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddOrEditExperience}>{editMode ? "Save" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AddExperiences;
