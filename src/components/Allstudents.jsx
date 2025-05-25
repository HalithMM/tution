import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../config/firebase';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';

export const Allstudents = () => {
    const navigate = useNavigate()
    const [studentData , setStudentData] = useState([]);
    const [filterData , setFilterData] = useState([]);
    const [searchName , setSearchName] = useState(''); 
    const studentRef = collection(db, "Students");
    const student = () => {
      try {

          const unsubscribe = onSnapshot(studentRef, (snapshot) => {
              setStudentData(snapshot.docs.map((doc) => ({
                  ...doc.data(),
                  id: doc.id
              }))); 
          });
  
          // Return the unsubscribe function so it can be cleaned up later
          return unsubscribe;
      } catch (error) {
          console.log(error);
      }
  };
  useEffect(() => { 
    const unsubscribe = student();
    
    // Cleanup function to unsubscribe from realtime updates
    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
}, []); // Empty dependency array means this runs once on mount
 
    const filterstudent = async() => {
        try {
          const filter = studentData.filter(student  => student.studentName.toLowerCase().includes(searchName.toLowerCase()))
            setFilterData(filter);
        } catch (error) {
            console.log(error);
        } 
    }

    useEffect(()=>{
        filterstudent();
    },[studentData,searchName])

    const ViewData = async (studentID) => {
      navigate(`/admin/student/${studentID}`)
    }

    const handleBack = () => {
      navigate(-1); // Go back to previous page
    };

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-tr from-white via-gray-50 to-white min-h-screen">
    <div className="mb-6 flex items-center gap-3">
      <button
        onClick={handleBack}
        className="text-blue-600 hover:text-blue-800 transition text-sm"
      >
        ← Back to Classes
      </button>
      <h2 className="text-2xl font-bold text-gray-800">Student Management</h2>
    </div>

    <div className="mb-6">
      <input
        type="text"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        placeholder="Search student by name"
        className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
      <table className="min-w-full table-auto text-sm">
        <thead className="bg-blue-50 text-gray-700 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-6 py-4 text-left">Name</th>
            <th className="px-6 py-4 text-left">Class</th>
            <th className="px-6 py-4 text-left">School</th>
            <th className="px-6 py-4 text-left">Father</th>
            <th className="px-6 py-4 text-left">Phone</th>
            <th className="px-6 py-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filterData.length > 0 ? (
            filterData.map((student, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-50 transition-all duration-150"
              >
                <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                  {student.studentName}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {student.standard}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {student.schoolName}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {student.fatherName}
                </td>
                <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                  {student.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
                    onClick={() => ViewData(student.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-10 text-center text-gray-500 text-sm"
              >
                No students found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
  )
}
