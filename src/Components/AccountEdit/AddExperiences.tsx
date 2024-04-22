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
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CustomIconButton from "../DataDisplay/CustomIconButton";

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
      setExperiences(experiences.map((exp) => (exp.id === currentExperience.id ? currentExperience : exp)));
    } else {
      setExperiences([...experiences, currentExperience]);
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
            <AddIcon />
          </CustomIconButton>
        </Tooltip>
      </Stack>

      {/* List of experiences with edit and delete options */}
      {experiences.map((experience, _) => (
        <div key={experience.id}>
          <h3>{experience.subject}</h3>
          <p>{experience.description}</p>
          <CustomIconButton onClick={() => handleOpenDialog(experience)}>
            <EditIcon />
          </CustomIconButton>
          <CustomIconButton onClick={() => handleDeleteExperience(experience.id)} color="error">
            <DeleteIcon />
          </CustomIconButton>
        </div>
      ))}

      {/* Dialog for adding or editing experience */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editMode ? "Edit Experience" : "Add New Experience"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="subject"
            label="Subject"
            type="text"
            fullWidth
            variant="standard"
            value={currentExperience.subject}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="standard"
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
