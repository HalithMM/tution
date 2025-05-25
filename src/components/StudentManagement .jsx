import { useState } from 'react';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import { toast } from 'react-toastify';

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Tamil",
  "Hindi",
  "Social Science",
  "History",
  "Geography",
  "Computer Science",
  "Accountancy",
  "Commerce",
  "Economics",
  "Business Studies",
  "Political Science",
  "Psychology",
  "MS Office (Word, Excel, PowerPoint)",
  "Advanced Excel",
  "Spoken English",
  "C Programming",
  "C++",
  "Java",
  "Python",
  "Web Development (HTML, CSS, JavaScript)",
  "All",
];

const ClassManagement = ({onClose}) => {
  const [className, setClassName] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const classRef = collection(db, "Classes");

  const handleCreateClass = async () => {
    if (!className.trim()) {
      toast.error("Class name cannot be empty");
      return;
    }

    if (selectedSubjects.length === 0) {
      toast.error("Please select at least one subject");
      return;
    }

    setIsSubmitting(true);

    try {
      await setDoc(doc(classRef, `${className}th`), {
        subjects: selectedSubjects,
        createdAt: serverTimestamp(),
        students: []
      }); 
      toast.success(`Class created successfully `);
      setClassName("");
      setSelectedSubjects([]);
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error("Failed to create class");
    } finally {
      setIsSubmitting(false);
      onClose(); 
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Class
        </Typography>
        
        <TextField
          fullWidth
          label="Class Name"
          variant="outlined"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="e.g., 10th, 12th, NEET, JEE"
          required
          sx={{ mb: 3 }}
        />
        
        <Autocomplete
          multiple
          options={subjects}
          getOptionLabel={(option) => option}
          value={selectedSubjects}
          onChange={(event, newValue) => {
            setSelectedSubjects(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Subjects"
              placeholder="Choose subjects"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                {...getTagProps({ index })}
                key={option}
              />
            ))
          }
          sx={{ mb: 3 }}
        />
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateClass}
          disabled={isSubmitting || !className || selectedSubjects.length === 0}
          fullWidth
          size="large"
        >
          {isSubmitting ? "Creating..." : "Create Class"}
        </Button>
      </Box>
    </Container>
  );
};

export default ClassManagement;