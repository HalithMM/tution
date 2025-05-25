import { collection, doc, getDoc, getDocs, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { db } from '../config/firebase';
import { Button } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Teacherform } from './Teacherform';
import { toast } from 'react-toastify';

export const TeacherDet = () => {
    const { teacherId } = useParams();
    const [teacherDetails, setTeacherDetails] = useState(null); 
    const [salaryDetails, setSalaryDetails] = useState(null);
    const [isEdit , setEdit] = useState(false);
    useEffect(() => {
      // Realtime listener for teacher details
      const teacherRef = doc(db, "Teachers", teacherId);
      const unsubscribeTeacher = onSnapshot(teacherRef, (teacherSnap) => {
        if (teacherSnap.exists()) {
          setTeacherDetails({
            ...teacherSnap.data(),
            id: teacherSnap.id,
            Standards: teacherSnap.data().Standards,
            subjects: teacherSnap.data().subjects,
          });
        } else {
          console.log("No teacher data found"); // Maintained original logging
          toast.error("No teacher data found"); // Maintained original logging
        }
      });
    
      // Realtime listener for salary details
      const salaryCollectionRef = collection(db, "Teachers", teacherId, "salaryDetails");
      const unsubscribeSalary = onSnapshot(salaryCollectionRef, (snapshot) => {
        try {
          setSalaryDetails(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        } catch (error) {
          console.error("Error fetching salary:", error); // Maintained error handling
        }
      });
    
      // Cleanup function
      return () => {
        unsubscribeTeacher();
        unsubscribeSalary();
      };
    }, [teacherId]); // Maintained original dependency

    const editHandler = (data) => {
      console.log(data);
      setEdit(true);
    }
    
    return (
      <>
      {isEdit?(
        <div>
          <Teacherform details={teacherDetails} edit={isEdit}/>
        </div>
      ):(<div>
  {teacherDetails ? (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">{teacherDetails.teacherName}</h1>
        <p className="text-lg text-gray-600">Teaches: {teacherDetails.Standards}</p>
        <Button variant='outlined' onClick={()=>editHandler(teacherDetails)}><Edit/></Button>
      </div>
      {/* Main Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-8">
        {/* Personal Info */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Personal Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium text-gray-600">Phone:</span> {teacherDetails.teacherNumber}</p>
              <p><span className="font-medium text-gray-600">Date of Joining:</span> {teacherDetails.DateofJoin}</p>
            </div>
          </div>
        </div>

        {/* School Info */}
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">School Information</h2>
            <p className="text-gray-700">{teacherDetails.schoolName}</p>
          </div>

          {/* Subjects */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Subjects</h2>
            <div className="flex flex-wrap gap-2">
              {teacherDetails.subjects.map((subject, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Salary Details */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Salary History</h2>
        {salaryDetails && salaryDetails.length > 0 ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-4 gap-4 font-medium text-gray-700 border-b pb-2 mb-2">
              <div>Month</div>
              <div>Transaction</div>
              <div>Salary</div>
              <div>Phone</div>
            </div>
            {salaryDetails.map((data, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 py-2 border-b last:border-b-0">
                <div>{data.Month}</div>
                <div>{data.Transaction}</div>
                <div>₹{data.salaryAmount}</div>
                <div>{data.teacherNumber}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No salary records found</p>
        )}
      </div>
    </div>
  ) : (
    <div className="text-center py-12">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600">Loading teacher details...</p>
    </div>
  )}
</div>)}
      
      </>
        

    );
};
