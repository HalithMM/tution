import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import Loader from './Loader';

export const ClassDet = () => {
  const [classDet, setClassDet] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = () => {
      try {
        const unsubscribe = onSnapshot(collection(db, "Classes"), (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id
          }));
          setClassDet(data);
          setLoading(false);
        });
  
        // Return the unsubscribe function to clean up the listener
        return unsubscribe;
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
  
    const unsubscribe = fetchData();
  
    // Clean up the listener when the component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleViewClass = (className) => {
    navigate(`/admin/class/${className}`);
  };

  // Filter classes to only show those with students.length > 0
  const classesWithStudents = classDet.filter(classItem => 
    Array.isArray(classItem.students) && classItem.students.length > 0
  );

  if (loading) {
    return (
      <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden h-[60vh] flex items-center justify-center">
        <div className="text-gray-500"><Loader/></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden h-[60vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Class Details</h2>
      </div>
      {classesWithStudents.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classesWithStudents.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {classItem.className || classItem.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {classItem.students.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleViewClass(classItem.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition shadow-sm"
                    >
                      View Dashboard
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          No classes with students found. Please add students to classes first.
        </div>
      )}
    </div>
  );
};