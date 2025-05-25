import { Autocomplete, TextField } from '@mui/material';
import { collection, doc, setDoc, updateDoc, getDocs, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase'; 
import { toast } from 'react-toastify';

const Subjects = [
  "English", "Maths", "Physics", "Chemistry", "Biology", "Commerce", "All",
];

const Standards = [
  "8th", "9th", "10th", "11th", "12th",
];

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

const DateofJoin = new Date().toLocaleDateString();

export const Teacherform = ({details, edit, onClose}) => {
  const [standards, setStandards] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacherDetails, setTeacherDetails] = useState({
    teacherName: "",
    teacherNumber: "",
    Standards: [],
    subjects: [],
    schoolName: "",
    DateofJoin: new Date().toLocaleDateString(),
    role: "teacher",
  });

  const teacherRef = collection(db, "Teachers");
  const classRef = collection(db, "Classes");

  useEffect(() => {
    if (details) {
      setTeacherDetails(details);
      // Fetch subjects if standards exist in the data being edited
      if (details.Standards && details.Standards.length > 0) {
        // For simplicity, we'll fetch subjects for the first standard
        fetchSubjects(details.Standards[0]);
      }
    }
    fetchStandards();
  }, [details]);

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
    setTeacherDetails(prev => ({
      ...prev,
      [name]: value
    }));

    // If standard is changed, fetch the new subjects
    if (name === "Standards" && value && value.length > 0) {
      // For simplicity, we'll fetch subjects for the first selected standard
      fetchSubjects(value[0]);
    }
  };

  const handleTeacherDetails = (e) => {
    const {name, value} = e.target;
    setTeacherDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitTeacherDetails = async(e) => {
    e.preventDefault();
    try {
      await setDoc(doc(teacherRef, teacherDetails.teacherName), {
        ...teacherDetails,
        DateofJoin: new Date().toLocaleDateString()
      });
      setTeacherDetails({ 
        teacherName: "",
        teacherNumber: "",
        Standards: [],
        subjects: [],
        schoolName: "",
        DateofJoin: new Date().toLocaleDateString(),
        role: "teacher",
      });
      console.log("Data saved");
      toast.success("Data saved");
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleUpdateTeacherDetails = async(e) => {
    e.preventDefault();
    const docRef = doc(db, "Teachers", teacherDetails.teacherName);
    try {
      await updateDoc(docRef, teacherDetails);
      console.log(teacherDetails);
      console.log("Data updated");
      toast.success("Data updated");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } 
  };

  return (
    <>
      {edit ? (
        <div className="flex justify-center mt-8">
          <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Edit Teacher Details 
            </h1>
        
            <form onSubmit={handleUpdateTeacherDetails} className="space-y-6">
              {/* Row 1: Teacher Name & Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Teacher Name</label>
                  <input
                    type="text"
                    name="teacherName"
                    disabled
                    value={teacherDetails.teacherName}
                    onChange={handleTeacherDetails}
                    placeholder="Enter teacher's full name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="teacherNumber"
                    value={teacherDetails.teacherNumber}
                    onChange={handleTeacherDetails}
                    placeholder="Enter phone number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
        
              {/* Row 2: Standards & Subjects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Standard</label>
                  <Autocomplete
                    multiple
                    disablePortal
                    options={standards}
                    value={teacherDetails.Standards}
                    onChange={(e, v) => handleAutocomplete("Standards", v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Standard"
                        className="w-full"
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Subjects</label>
                  <Autocomplete
                    multiple
                    disablePortal
                    options={subjects.length > 0 ? subjects : Subjects}
                    value={teacherDetails.subjects}
                    onChange={(e, v) => handleAutocomplete("subjects", v)}
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
        
              {/* Row 3: School Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">School Name</label>
                <Autocomplete
                  disablePortal
                  options={schoolNames}
                  value={teacherDetails.schoolName}
                  onChange={(e, v) => handleAutocomplete("schoolName", v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Select School" className="w-full" />
                  )}
                />
              </div>
        
              {/* Row 4: Date of Joining */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Date of Joining</label>
                <input
                  type="text"
                  name="dateOfJoin"
                  value={teacherDetails.DateofJoin}
                  onChange={handleTeacherDetails}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
        
              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 w-full"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex justify-center mt-8">
          <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-3xl">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Teacher Registration Form
            </h1>
        
            <form onSubmit={handleSubmitTeacherDetails} className="space-y-6">
              {/* Row 1: Teacher Name & Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Teacher Name</label>
                  <input
                    type="text"
                    name="teacherName"
                    value={teacherDetails.teacherName}
                    onChange={handleTeacherDetails}
                    placeholder="Enter teacher's full name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="teacherNumber"
                    value={teacherDetails.teacherNumber}
                    onChange={handleTeacherDetails}
                    placeholder="Enter phone number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
        
              {/* Row 2: Standards & Subjects */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Standard</label>
                  <Autocomplete
                    multiple
                    disablePortal
                    options={standards}
                    value={teacherDetails.Standards}
                    onChange={(e, v) => handleAutocomplete("Standards", v)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Standard" 
                        className="w-full" 
                      />
                    )}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">Subjects</label>
                  <Autocomplete
                    multiple
                    disablePortal
                    options={subjects.length > 0 ? subjects : Subjects}
                    value={teacherDetails.subjects}
                    onChange={(e, v) => handleAutocomplete("subjects", v)}
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
        
              {/* Row 3: School Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">School Name</label>
                <Autocomplete
                  disablePortal
                  options={schoolNames}
                  value={teacherDetails.schoolName}
                  onChange={(e, v) => handleAutocomplete("schoolName", v)}
                  renderInput={(params) => (
                    <TextField {...params} label="Select School" required className="w-full" />
                  )}
                />
              </div>
        
              {/* Row 4: Date of Joining */}
              <div>
                <label className="block text-gray-700 font-medium mb-2">Date of Joining</label>
                <input
                  type="text"
                  name="dateOfJoin"
                  value={teacherDetails.DateofJoin}
                  onChange={handleTeacherDetails}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
        
              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 w-full"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </> 
  );
};