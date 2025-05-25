import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../config/firebase';
import { Button } from '@mui/material';

export const ClassDashboard = () => {
  const { className } = useParams();
  const [classData, setClassData] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubjectTab, setActiveSubjectTab] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    
    // Realtime listener for class data
    const classUnsubscribe = onSnapshot(
      doc(db, "Classes", className),
      (classDoc) => {
        if (classDoc.exists()) {
          setClassData({
            ...classDoc.data(),
            id: classDoc.id,
            createdAt: classDoc.data().createdAt?.toDate()?.toString() || 'N/A'
          });
        } else {
          setClassData(null);
        }
      },
      (error) => {
        console.error("Error listening to class data:", error);
        setLoading(false);
      }
    );
  
    // Realtime listener for teachers collection
    const teachersUnsubscribe = onSnapshot(
      collection(db, "Teachers"),
      (teachersSnapshot) => {
        const teachersData = teachersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTeachers(teachersData);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to teachers data:", error);
        setLoading(false);
      }
    );
  
    // Cleanup function
    return () => {
      classUnsubscribe();
      teachersUnsubscribe();
    };
  }, [className]);

  const getAllSubjects = () => {
    if (!classData?.students) return [];
    const subjects = new Set();
    classData.students.forEach(student => {
      student.subjects?.forEach(subject => subjects.add(subject));
    });
    return Array.from(subjects).sort();
  };

  const getFilteredStudents = () => {
    if (!classData?.students) return [];
    if (activeSubjectTab === 'All') return classData.students;
    return classData.students.filter(s => s.subjects?.includes(activeSubjectTab));
  };

  const getStudentsByShift = (students) => {
    const shifts = {
      'Morning Batch': [],
      'Afternoon Batch': [],
      'Evening Batch': []
    };

    students.forEach(student => {
      if (student.shift === 'Morning Batch') {
        shifts['Morning Batch'].push(student);
      } else if (student.shift === 'Afternoon Batch') {
        shifts['Afternoon Batch'].push(student);
      } else if (student.shift === 'Evening Batch') {
        shifts['Evening Batch'].push(student);
      }
    });

    return shifts;
  };

  const getTeachersForSubject = (subject) => {
    return teachers.filter(teacher => 
      teacher.subjects?.includes(subject) && 
      teacher.Standards?.includes(className)
    );
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const ViewData = async (studentID) => {
    navigate(`/admin/student/${studentID}`)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-500">Loading class details...</div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-6">
        <div className="text-red-500">Class not found</div>
        <button 
          onClick={handleBack}
          className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  const filteredStudents = getFilteredStudents();
  const studentsByShift = getStudentsByShift(filteredStudents);

  return (
    <div className="p-6 bg-white rounded-xl shadow-sm">
      <button 
        onClick={handleBack}
        className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
      >
        ← Back to Classes
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{classData.className || classData.id} Dashboard</h1>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
          <div>Total Students: {classData.students?.length || 0}</div>
        </div>
      </div> 
      <div className="mb-6 overflow-x-auto">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-lg ${activeSubjectTab === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setActiveSubjectTab('All')}
          >
            All Students
          </button>
          {getAllSubjects().map(subject => (
            <button
              key={subject}
              className={`px-4 py-2 rounded-lg ${activeSubjectTab === subject ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              onClick={() => setActiveSubjectTab(subject)}
            >
              {subject}
            </button>
          ))}
        </div>
      </div> 
      {activeSubjectTab !== 'All' && (
        <div className="mb-6 rounded-lg p-4 bg-gray-50">
          <h2 className="text-lg font-medium mb-3">Teacher Information for {activeSubjectTab}</h2>
          {getTeachersForSubject(activeSubjectTab).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>  
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getTeachersForSubject(activeSubjectTab).map((teacher, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {teacher.teacherName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.teacherNumber}
                      </td> 
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-gray-500">No teacher assigned for this subject</div>
          )}
        </div>
      )} 
      
      {Object.entries(studentsByShift).map(([shift, students]) => (
        students.length > 0 && (
          <div key={shift} className="mb-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
            <h3 className="p-4 bg-gray-50 text-lg font-medium text-gray-800">
              {shift} ({students.length} students)
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th> 
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {student.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.shift}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button size='small' variant='contained' onClick={()=>ViewData(student.studentName)}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ))}

      {filteredStudents.length === 0 && (
        <div className="p-6 text-center text-gray-500">
          No students found {activeSubjectTab !== 'All' ? `in ${activeSubjectTab}` : ''}
        </div>
      )}
    </div>
  );
};