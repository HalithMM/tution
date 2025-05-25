import {
  Autocomplete,
  TextField,
} from "@mui/material";
import { arrayRemove, arrayUnion, collection, doc, getDoc, setDoc, updateDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { toast } from "react-toastify";

const schoolNames = [
  "Karpaga Vinayaga Matriculation Higher Secondary School",
  "Mount Zion International School",
  "Sacred Heart School",
  "Mai Skool",
  "Sudharsan Vidhya Vikas",
  "Jayarani Matriculation Higher Secondary School",
  "Mount Zion Matriculation Higher Secondary School",
  "Vairams Matriculation School",
  "SFS Matriculation Higher Secondary School",
  "St Marys Boys Higher Secondary School",
  "Adr Matriculation Higher Secondary School",
  "Sri Manickam Matriculation Higher Secondary School",
  "Brahathambal Higher Secondary School",
  "Telce Higher Secondary School",
];

const Shift = [
  "Morning Batch" , "Afternoon Batch" , "Evening Batch"
]

const currentDate = new Date().toLocaleDateString();

export const Studentform = ({ data, edit, onEditComplete,onClose }) => {
  const [studentDetails, setStudentDetails] = useState({
    studentName: "",
    fatherName: "",
    phoneNumber: "",
    schoolName: "",
    standard: "",
    subjects: [],
    shift: "",
    Date: currentDate,
  });
  const [standards, setStandards] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const studentRef = collection(db, "Students");
  const classRef = collection(db, "Classes");

  useEffect(() => {
    if (data) {
      setStudentDetails(data);
      // Fetch subjects if standard exists in the data being edited
      if (data.standard) {
        fetchSubjects(data.standard);
      }
    }
    fetchStandards();
  }, [data]);

  const fetchStandards = async () => {
    try {
      const querySnapshot = await getDocs(classRef);
      const standardsList = querySnapshot.docs.map(doc => doc.id);
      setStandards(standardsList);
    } catch (error) {
      console.error("Error fetching standards:", error);
    }
  };

  const fetchSubjects = async (standard) => {
    try {
      const classDocRef = doc(classRef, standard);
      const classDoc = await getDoc(classDocRef);
      if (classDoc.exists()) {
        const classData = classDoc.data();
        setSubjects(classData.subjects || []);
      } else {
        setSubjects([]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setSubjects([]);
    }
  };

  const handleAutocomplete = (name, value) => {
    setStudentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If standard is changed, fetch the new subjects
    if (name === "standard" && value) {
      fetchSubjects(value);
    }
  };

  const handleStudentDetails = (e) => {
    const { name, value } = e.target;
    setStudentDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitStudentDetails = async (e) => {
    e.preventDefault();
    if (!studentDetails.studentName.trim()) {
      console.log("Student Name is required to submit.");
      toast.error("Student Name is required to submit.");
      return;
    }

    try {
      // Add student to Students collection
      await setDoc(doc(studentRef, studentDetails.studentName.trim()), {
        ...studentDetails,
        phoneNumber: studentDetails.phoneNumber.startsWith("+91") 
          ? studentDetails.phoneNumber 
          : `+91${studentDetails.phoneNumber}`
      });
      if (studentDetails.standard) {
        const classDocRef = doc(classRef, studentDetails.standard);
        await updateDoc(classDocRef, {
          students: arrayUnion(studentDetails)
        });
      }
      
      setStudentDetails({
        studentName: "",
        fatherName: "",
        phoneNumber: "",
        schoolName: "",
        standard: "",
        subjects: [],
        Date: currentDate,
      });
      onClose();
      toast.success("Register Successfully");
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateStudentDetails = async (e) => {
    e.preventDefault();
    if (!studentDetails.studentName.trim()) {
      console.log("Student Name is required to submit.");
      toast.error("Student Name is required to submit.");
      return;
    }
  
    try { 
      const studentDocRef = doc(db, "Students", studentDetails.studentName.trim());
      await updateDoc(studentDocRef, {
        ...studentDetails,
        phoneNumber: studentDetails.phoneNumber.startsWith("+91") 
          ? studentDetails.phoneNumber 
          : `+91${studentDetails.phoneNumber}`
      });
      if (studentDetails.standard) { 
        const classDocRef = doc(classRef, studentDetails.standard);
        const classDoc = await getDoc(classDocRef);
        
        if (classDoc.exists()) {
          const studentsArray = classDoc.data().students || [];
           
          const studentIndex = studentsArray.findIndex(
            student => student.studentName === data.studentName
          );
          
          if (studentIndex !== -1) {
            // Create a new array with the updated student
            const updatedStudents = [...studentsArray];
            updatedStudents[studentIndex] = studentDetails;
            
            // Update the entire array
            await updateDoc(classDocRef, {
              students: updatedStudents
            });
          } else {
            // If student not found, add them (handles case where standard changed)
            await updateDoc(classDocRef, {
              students: arrayUnion(studentDetails)
            });
          }
          
          // If standard changed, remove from old class
          if (data?.standard && data.standard !== studentDetails.standard) {
            const oldClassDocRef = doc(classRef, data.standard);
            const oldClassDoc = await getDoc(oldClassDocRef);
            
            if (oldClassDoc.exists()) {
              const oldStudents = oldClassDoc.data().students || [];
              const updatedOldStudents = oldStudents.filter(
                student => student.studentName !== data.studentName
              );
              
              await updateDoc(oldClassDocRef, {
                students: updatedOldStudents
              });
            }
          }
        }
      }
      
      console.log("Student updated successfully");
      onEditComplete();
      toast.success("Student updated successfully");
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Something went worng in updating student");
    }
  }

  return (
    <div className="flex justify-center items-center mt-10 px-4">
      {edit ? (
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Student Edit Form
          </h1>
          <form onSubmit={handleUpdateStudentDetails} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={studentDetails.studentName || ""}
                  onChange={handleStudentDetails}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
      
              {/* Father's Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={studentDetails.fatherName || ""}
                  onChange={handleStudentDetails}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
      
              {/* Phone Number */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={studentDetails.phoneNumber || ""}
                  onChange={handleStudentDetails}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
      
              {/* School Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">School Name</label>
                <Autocomplete
                  className="w-full"
                  disablePortal
                  value={studentDetails.schoolName || ""}
                  onChange={(e, v) => handleAutocomplete("schoolName", v)}
                  options={schoolNames}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select School"
                      required
                      className="w-full"
                    />
                  )}
                />
              </div>
      
              {/* Standard */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Standard</label>
                <Autocomplete
                  className="w-full"
                  disablePortal
                  value={studentDetails.standard || ""}
                  onChange={(e, v) => handleAutocomplete("standard", v)}
                  options={standards}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Standard"
                      required
                      className="w-full"
                    />
                  )}
                />
              </div>  
              <div>
                <label className="block text-gray-700 font-medium mb-2">Batch</label>
                <Autocomplete
                  className="w-full"
                  disablePortal
                  value={studentDetails.shift || ""}
                  onChange={(e, v) => handleAutocomplete("shift", v)}
                  options={Shift}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Batch"
                      required
                      className="w-full"
                    />
                  )}
                />
              </div>  
      
            {/* Subjects */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Subjects</label>
              <Autocomplete
                className="w-full"
                multiple
                disablePortal
                value={studentDetails.subjects || []}
                onChange={(e, v) => handleAutocomplete("subjects", v)}
                options={subjects}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Subjects" 
                    className="w-full"
                  />
                )}
              />
            </div>
                </div>
            {/* Date of Joining */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date of Joining</label>
              <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
                {studentDetails.Date || currentDate}
              </div>
            </div>
      
            {/* Submit Button */}
            <div className="text-center mt-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 w-full"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Student Registration Form
          </h1>
          <form onSubmit={handleSubmitStudentDetails} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={studentDetails.studentName || ""}
                  onChange={handleStudentDetails}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
      
              {/* Father's Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={studentDetails.fatherName || ""}
                  onChange={handleStudentDetails}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
      
              {/* Phone Number */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={studentDetails.phoneNumber || ""}
                  onChange={handleStudentDetails}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
      
              {/* School Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">School Name</label>
                <Autocomplete
                  className="w-full"
                  disablePortal
                  value={studentDetails.schoolName || ""}
                  onChange={(e, v) => handleAutocomplete("schoolName", v)}
                  options={schoolNames}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select School"
                      required
                      className="w-full"
                    />
                  )}
                />
              </div>
      
              {/* Standard */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Standard</label>
                <Autocomplete
                  className="w-full"
                  disablePortal
                  value={studentDetails.standard || ""}
                  onChange={(e, v) => handleAutocomplete("standard", v)}
                  options={standards}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Standard"
                      required
                      className="w-full"
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Batch</label>
                <Autocomplete
                  className="w-full"
                  disablePortal
                  value={studentDetails.shift || ""}
                  onChange={(e, v) => handleAutocomplete("shift", v)}
                  options={Shift}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Batch"
                      required
                      className="w-full"
                    />
                  )}
                />
              </div>  
            </div>
      
            {/* Subjects */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Subjects</label>
              <Autocomplete
                className="w-full"
                multiple
                disablePortal
                value={studentDetails.subjects || []}
                onChange={(e, v) => handleAutocomplete("subjects", v)}
                options={subjects}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Subjects" 
                    className="w-full"
                  />
                )}
              />
            </div>
      
            {/* Date of Joining */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Date of Joining</label>
              <div className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100">
                {currentDate}
              </div>
            </div>
      
            {/* Submit Button */}
            <div className="text-center mt-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 w-full"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};