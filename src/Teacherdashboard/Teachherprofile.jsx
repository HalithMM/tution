import { Avatar, Button, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../config/firebase";
import moment from "moment";
import ClearIcon from '@mui/icons-material/Clear';
import CheckIcon from '@mui/icons-material/Check'; 
export const Teacherprofile = () => {
  const currentMonth = moment(new Date()).format("MMMM-YYYY")
  console.log(currentMonth);
  const { name } = useParams();
  const [bioData , setBioData] = useState(null);
  const [salaryData , setSalaryData] = useState([]);
  const [studentData,setStudentData] = useState([])
  const [bioDetail , setBioDetail] = useState(true);
  const [salaryDetail , setSalaryDetail] = useState(false);
  const [studentDetail , setStudentDetail] = useState(false);
  const [attendanceDetail , setAttendanceDetail] = useState(false);
  const [currentDate , setCurrentDate ] = useState(new Date()); 
  const [attendanceStatusChange , setAttendanceStatusChange] = useState({});
  const bioHandler = () => { 
      setStudentDetail(false)
      setSalaryDetail(false)
      setAttendanceDetail(false)
      setBioDetail(true)
  };
  const salarHandler = () => { 
      setBioDetail(false)
      setStudentDetail(false)
      setAttendanceDetail(false)
      setSalaryDetail(true)
  }
  const studentHandler = () => {
    setBioDetail(false)
    setSalaryDetail(false)
    setAttendanceDetail(false)
    setStudentDetail(true) 
  }
  const attendanceHandler = () => {
    setBioDetail(false)
    setSalaryDetail(false)
    setStudentDetail(false)
    setAttendanceDetail(true)
  } 
  const handleAttendanceChange = async (studentId, studentName, stat) => {
    if (!stat) return;
  
    try {
      const dateKey = moment(currentDate).format("D-MMMM-YYYY");
      const attendanceRef = doc(db, "Students", studentId, "Attendance", currentMonth);
      const attendanceSnap = await getDoc(attendanceRef);
  
      let existingAttendance = [];
  
      // If document exists, get existing Attendance array
      if (attendanceSnap.exists()) {
        const data = attendanceSnap.data();
        existingAttendance = data.Attendance || [];
      }
  
      // Check if today's date is already recorded to avoid duplicates
      const alreadyMarked = existingAttendance.find(entry => entry.date === dateKey);
  
      if (!alreadyMarked) {
        const newEntry = {
          status: stat,
          date: dateKey,
          AttendanceIncharge: name,
        };
  
        const updatedAttendance = [...existingAttendance, newEntry];
  
        await setDoc(attendanceRef, { Attendance: updatedAttendance }, { merge: true });
  
        setAttendanceStatusChange(prev => ({
          ...prev,
          [studentId]: stat
        }));
      } else {
        console.log("Attendance already marked for today.");
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };
  
  // Update the loadAttendanceData function:
  const loadAttendanceData = async () => {
    if (!studentData.length || !attendanceDetail) return;
    
    try { 
      const dateKey = moment(currentDate).format("D-MMMM-YYYY");
      const statusMap = {};
      
      await Promise.all(studentData.map(async (student) => {
        const attendanceRef = doc(db, "Students", student.id, "Attendance", currentMonth);
        const attendanceSnap = await getDoc(attendanceRef);
        
        if (attendanceSnap.exists()) {
          const attendanceData = attendanceSnap.data();
          if (attendanceData[dateKey]) {
            statusMap[student.id] = attendanceData[dateKey];
          }
        }
      }));
      
      setAttendanceStatusChange(statusMap);
    } catch (error) {
      console.error("Error loading attendance:", error);
    }  
  };
  
  useEffect(() => {
    if (!name) return;
  
    // Teacher details realtime listener
    const teacherRef = doc(db, "Teachers", name);
    const unsubscribeTeacher = onSnapshot(teacherRef, (teacherDoc) => {
      try {
        if (!teacherDoc.exists()) {
          console.log("Teacher not found");
          return;
        }
  
        const teacherData = teacherDoc.data();
        setBioData(teacherData);
  
        // Salary details realtime listener
        const salaryRef = collection(db, "Teachers", name, "salaryDetails");
        const unsubscribeSalary = onSnapshot(salaryRef, (salarySnapshot) => {
          const salaryDetails = salarySnapshot.docs.map(doc => doc.data());
          setSalaryData(salaryDetails);
        });
  
        // Students matching subjects realtime listener
        if (teacherData.subjects?.length > 0) {
          const studentsRef = collection(db, "Students");
          const unsubscribeStudents = onSnapshot(studentsRef, (studentsSnapshot) => {
            const matchingStudents = studentsSnapshot.docs
              .filter(doc => {
                const student = doc.data();
                return student.subjects?.some(sub => 
                  teacherData.subjects.includes(sub)
                );
              })
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
            console.log(matchingStudents);
            setStudentData(matchingStudents);
          });
  
          return () => {
            unsubscribeSalary();
            unsubscribeStudents();
          };
        }
  
        return unsubscribeSalary;
      } catch (error) {
        console.log("Error fetching data:", error);
      }
    });
  
    return () => {
      unsubscribeTeacher();
    };
  }, [name]);
  
  useEffect(() => {
    if (attendanceDetail) {
      loadAttendanceData();
    }
  }, [currentDate, attendanceDetail]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
  {/* Sidebar */}
  <div className="w-full md:w-1/4 bg-gradient-to-b from-blue-600 to-blue-800 p-6 flex flex-col items-center gap-6 text-white shadow-xl">
    <div className="flex flex-col items-center gap-4">
      <Avatar 
        alt={name} 
        src="" 
        sx={{ 
          width: 120, 
          height: 120,
          border: '3px solid white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }} 
      />
      <h1 className="font-bold text-2xl text-white">{name}</h1>
      <p className="text-blue-100 text-center">
        {name}'s Dashboard
      </p>
    </div>
    
    <div className="flex flex-col w-full gap-3 mt-6">
    <Button 
        onClick={bioHandler}
        className="w-full !bg-white  text-white transition-all rounded-lg py-3 shadow-lg font-medium transform hover:scale-[1.02]"
      >
        Bio Info
      </Button>
      <Button
        onClick={studentHandler}
        className="w-full !bg-white  text-white transition-all rounded-lg py-3 shadow-lg font-medium transform hover:scale-[1.02]"
      >
        Student Info
      </Button>
      <Button
        onClick={salarHandler}
        className="w-full !bg-white  text-white transition-all rounded-lg py-3 shadow-lg font-medium transform hover:scale-[1.02]"
      >
        Salary Info
      </Button>
      <Button
        onClick={attendanceHandler}
        className="w-full !bg-white  text-white transition-all rounded-lg py-3 shadow-lg font-medium transform hover:scale-[1.02]"
      >
        Attendance
      </Button>
    </div>
    
    <div className="mt-auto pt-6 text-blue-200 text-sm">
      Last login: {new Date().toLocaleString()}
    </div>
  </div> 
  
  {/* Main Content */}
  <div className="flex-1 p-4 md:p-8">
    {bioDetail && bioData && (
      <div className="bg-white overflow-hidden">
        <div className="p-5">
          <h1 className="text-2xl font-bold text-black">Bio Information</h1>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard label="Name" value={bioData.teacherName} />
            <InfoCard label="Phone" value={bioData.teacherNumber} />
            <InfoCard label="Email" value={bioData.email} />
            <InfoCard label="Joining Date" value={bioData.DateofJoin} />
            <InfoCard label="School" value={bioData.schoolName} />
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Subjects</h2>
            <div className="flex flex-wrap gap-2">
              {bioData.subjects?.map((sub, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {sub}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Standards</h2>
            <div className="flex flex-wrap gap-2">
              {bioData.Standards?.map((std, index) => (
                <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  {std}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )} 
    
    {salaryDetail && salaryData && (
      <div className="bg-white  overflow-hidden">
        <div className="  p-5">
          <h1 className="text-2xl font-bold">Salary Information</h1>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {salaryData.map((data, id) => (
                  <tr key={id} className={id % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.Month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{data.salaryAmount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.Transaction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
    
    {studentDetail && studentData && (
      <div className="bg-white   overflow-hidden ">
        <div className="p-5">
          <h1 className="text-2xl font-bold ">Student Information</h1>
        </div>
        <div className="">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studentData.map((student, id) => (
              <div key={id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{student.studentName}</h3>
                <p className="text-gray-600 mb-1"><span className="font-medium">Father:</span> {student.fatherName}</p>
                <p className="text-gray-600 mb-1"><span className="font-medium">Phone:</span> {student.phoneNumber}</p>
                <p className="text-gray-600"><span className="font-medium">School:</span> {student.schoolName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
   {attendanceDetail && (
  <div className=" mx-auto  bg-white "> 
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Attendance</h1>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <input 
          type="date" 
          value={moment(currentDate).format("YYYY-MM-DD")} 
          onChange={(e) => setCurrentDate(new Date(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <h1 className="text-gray-700 font-medium">Attendance Incharge: <span className="text-blue-600">{name}</span></h1>
      </div>
    </div> 
    <div className="space-y-4">
      {studentData.map((student, id) => (
        <div key={id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center">
            <span className="w-6 text-gray-500 font-medium">{id + 1}.</span>
            <h2 className="ml-2 text-gray-800 font-medium">{student.studentName}</h2>
          </div>
          
          <ToggleButtonGroup 
            size="small"
            value={attendanceStatusChange[student.id] || null} 
            exclusive 
            onChange={(e, newStatus) => handleAttendanceChange(student.id, student.studentName, newStatus)}
          >
            <ToggleButton 
              value="absent" 
              className="!px-3 !py-1"
              aria-label="absent"
            >
              <ClearIcon color="error" fontSize="small" />
            </ToggleButton>
            <ToggleButton 
              value="present" 
              className="!px-3 !py-1"
              aria-label="present"
            >
              <CheckIcon color="success" fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      ))}
    </div>
  </div>
)}
  </div>
</div>
  );
};
function InfoCard({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-800">{value || '-'}</p>
    </div>
  );
}
