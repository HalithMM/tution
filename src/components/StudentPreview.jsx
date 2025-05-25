import { arrayRemove, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../config/firebase";
import EditIcon from '@mui/icons-material/Edit'; 
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import { Studentform } from "./Studentform";
import { Box, ButtonGroup, Chip, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import moment from "moment";
import { toast } from "react-toastify";

export const StudentPreviewSection = () => {
  const navigate = useNavigate();
  const { studentID } = useParams();
  const [student, setStudent] = useState(null);
  const [billDetail, setBillDetail] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDialog, setDialog] = useState(false);
  const [attendanceData,setAttendanceData] = useState([]);
  // State for sidebar navigation
  const [isInfoDetail, setIsInfoDetail] = useState(true);
  const [isFeeDetail, setIsFeeDetail] = useState(false);
  const [isAttendanceDetail, setIsAttendanceDetail] = useState(false);

  const currentMonth = moment(new Date).format("MMMM-YYYY")
  console.log(currentMonth);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const studentDetailRef = doc(db, "Students", studentID);
        const Extract = await getDoc(studentDetailRef);
        if (Extract.exists()) {
          setStudent({ ...Extract.data(), id: Extract.id, subjects: Extract.data().subjects });
        } else {
          toast.error("There is No data");
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchStudent();
  }, [studentID]);

  const studentAttendanceData = async () => {
    const attendanceRef = collection(db, "Students", studentID, "Attendance");
    try {
      const Extract = await getDocs(attendanceRef);
      const fetchAttendance = Extract.docs.flatMap(doc => {
        const attendanceArray = doc.data().Attendance || [];
        return attendanceArray.map((item, index) => ({
          ...item,
          id: `${doc.id}-${index}`  
        }));
      });
      console.log("Attendance data:", fetchAttendance);
      setAttendanceData(fetchAttendance);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const fetchBillDetail = () => {
      try {
        const feeCollectionRef = collection(db, 'Students', studentID, 'feeDetail');
        const unsubscribe = onSnapshot(feeCollectionRef, (querySnapshot) => {
          const getFeeDetail = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id
          }));
          
          console.log(currentMonth); // Maintained original logging
          setBillDetail(getFeeDetail);
        });
  
        return unsubscribe; // Return cleanup function
      } catch (error) {
        console.log(error); // Maintained error handling
      }
    };
  
    const unsubscribeBillDetail = fetchBillDetail();
    studentAttendanceData(); // Maintained original function call
  
    // Cleanup function
    return () => {
      if (unsubscribeBillDetail) unsubscribeBillDetail();
    };
  }, [studentID]); // Maintained original dependency

  const EditHandler = (studentData) => {
    setEdit(true);
    setSelectedStudent(studentData);
  };

  const editComplete = () => {
    setEdit(false);
  };

  const DialogOpen = (data) => {
    setDialog(true);
  };

  const DeleteHandler = async (data) => {
    const discontinueRef = collection(db, "Discontinue");
    const studentID = data.studentName; 
    try { 
      await setDoc(doc(discontinueRef, studentID), data); 
      await deleteDoc(doc(db, "Students", studentID)); 
      if (data.standard) {
        const classDocRef = doc(db, "Classes", data.standard); 
        const classDoc = await getDoc(classDocRef);
        if (classDoc.exists()) { 
          const updatedStudents = classDoc.data().students.filter(
            student => student.studentName !== data.studentName
          ); 
          await updateDoc(classDocRef, {
            students: updatedStudents
          });
        }
      }  
      setDialog(false);
      navigate(-1);
    } catch (error) {
      console.error("Delete error:", error);
    }
};

  const closeDialog = () => { setDialog(false); };

  // Sidebar navigation handlers
  const openInfoDetail = () => {
    setIsInfoDetail(true);
    setIsFeeDetail(false);
    setIsAttendanceDetail(false);
  };

  const openFeeDetail = () => {
    setIsInfoDetail(false);
    setIsFeeDetail(true);
    setIsAttendanceDetail(false);
  };

  const openAttendanceDetail = () => {
    setIsInfoDetail(false);
    setIsFeeDetail(false);
    setIsAttendanceDetail(true);
  };

  return (
    <>
      {isEdit ? (
        <div className="border min-h-screen">
          <div>
            <h1>Edit {student.studentName} Details </h1>
            <div>
              <Studentform data={selectedStudent} edit={isEdit} onEditComplete={() => setEdit(false)} />
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
          {/* Sidebar */}
          <div className="bg-white shadow-md md:h-auto md:min-h-screen md:w-64 w-full p-4 flex flex-col">
            <h1 className="text-xl font-bold text-center text-blue-600 mb-6 py-2 border-b border-gray-200">
              {student?.studentName || 'Student'}
            </h1>
            <div className="space-y-3">
              <button
                onClick={openInfoDetail}
                className={`w-full py-3 px-4 rounded-lg transition duration-300 flex items-center ${isInfoDetail ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Student Info
              </button>
              <button
                onClick={openFeeDetail}
                className={`w-full py-3 px-4 rounded-lg transition duration-300 flex items-center ${isFeeDetail ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Fee Details
              </button>
              <button
                onClick={openAttendanceDetail}
                className={`w-full py-3 px-4 rounded-lg transition duration-300 flex items-center ${isAttendanceDetail ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Attendance
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4 md:p-8">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {isInfoDetail && student && (
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">{student.studentName}'s Bio Details</h1>
                    <div className="flex items-center space-x-4">
                      <Button variant="outlined" size="small" onClick={() => EditHandler(student)}>
                        <EditIcon fontSize="small" />
                      </Button>
                      <Button variant="outlined" size="small" onClick={DialogOpen}>
                        <DeleteIcon fontSize="small" />
                      </Button>
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Student ID: {studentID || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-lg font-semibold text-gray-700 mb-3">Personal Information</h2>
                      <div className="space-y-2">
                        <p><span className="font-medium text-gray-600">Student Name:</span> {student.studentName}</p>
                        <p><span className="font-medium text-gray-600">Father Name:</span> {student.fatherName}</p>
                        <p><span className="font-medium text-gray-600">Phone:</span> {student.phoneNumber}</p>
                        <p><span className="font-medium text-gray-600">Date of Join:</span> {student.Date}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h2 className="text-lg font-semibold text-gray-700 mb-3">Academic Information</h2>
                      <div className="space-y-2">
                        <p><span className="font-medium text-gray-600">School Name:</span> {student.schoolName}</p>
                        <p><span className="font-medium text-gray-600">Class/Grade:</span> {student.standard || 'N/A'}</p>
                        <Chip sx={{backgroundColor: '#22c55e',borderColor: '#22c55e',fontWeight: 500}} label={`Batch: ${student.shift || 'N/A'}`} color="!green-500" variant="outlined"/>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Subjects</h2>
                    <div className="flex flex-wrap gap-2">
                      {student.subjects?.map((sub, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {isFeeDetail && (
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-800 mb-6">Monthly Fee Details</h1>
                  {billDetail.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payment Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {billDetail.map((data, id) => (
                            <tr key={id} className={id % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {data.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {data.paymentType}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ₹{data.amount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  data.feeStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                                  data.feeStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {data.feeStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600">No payment history found</p>
                  )}
                </div>
              )}
              
              {isAttendanceDetail && (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance Record</h1>
    {attendanceData.length === 0 ? (
      <p className="text-gray-600">No attendance data found.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incharge</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceData.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {item.date || item.Date || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      item.status?.toLowerCase() === "present"
                        ? "bg-green-100 text-green-800"
                        : item.status?.toLowerCase() === "absent"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {item.status || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                  {item.AttendanceIncharge || item.incharge || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}
            </div>
          </div>
        </div>
      )}
      
      <Box>
        <Dialog open={isDialog} onClose={closeDialog}>
          <DialogContent>
            <Typography>Are you sure you want to delete this student's data?</Typography>
            <DialogActions>
              <Button onClick={closeDialog}>Cancel</Button>
              <Button onClick={() => DeleteHandler(student)} color="error">Delete</Button>
            </DialogActions>
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
};