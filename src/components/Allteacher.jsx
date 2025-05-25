import { collection, getDocs, onSnapshot } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { Box } from "@mui/material";
import { Salary } from "./Salary";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

export const Allteacher = () => {
  const navigate = useNavigate();
  const [teacherData, setTeacherData] = useState([]);
  const [searchName, setSearchName] = useState(""); 
  const teacherRef = collection(db, "Teachers");
  const [loading , setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); // Set loading to true before fetching data
    const unsubscribe = onSnapshot(teacherRef, (snapshot) => {
      setTeacherData(
        snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      );
    });
  setLoading(false); // Set loading to false once data is fetched
    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  const filterData = teacherData.filter((teacher) =>
    teacher.teacherName.toLowerCase().includes(searchName.toLowerCase())
  );

  const viewData = (teacherId) => {
    navigate(`/admin/teacher/${teacherId}`)
    console.log(teacherId);
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="">
            <Loader/>
        </div>
      </div>
    );
    
  }
  return (
    <>
    <div className="p-4 sm:p-8 bg-gradient-to-tr from-white via-gray-50 to-white min-h-screen">
  <div className="mb-6 flex items-center gap-3">
    <h2 className="text-2xl font-bold text-gray-800">Teacher Management</h2>
  </div>

  <div className="mb-6">
    <input
      type="text"
      value={searchName}
      onChange={(e) => setSearchName(e.target.value)}
      placeholder="Search teacher by name"
      className="w-full sm:w-1/2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
    <table className="min-w-full table-auto text-sm">
      <thead className="bg-blue-50 text-gray-700 uppercase text-xs tracking-wider">
        <tr>
          <th className="px-6 py-4 text-left">Name</th>
          <th className="px-6 py-4 text-left">Phone</th>
          <th className="px-6 py-4 text-left">Subjects</th>
          <th className="px-6 py-4 text-left">Classes</th>
          <th className="px-6 py-4 text-left">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {filterData.length > 0 ? (
          filterData.map((teacher, id) => (
            <tr
              key={id}
              className="hover:bg-gray-50 transition-all duration-150"
            >
              <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                {teacher.teacherName}
              </td>
              <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                {teacher.teacherNumber}
              </td>
              <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                {teacher.subjects.join(", ")}
              </td>
              <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                {teacher.Standards.join(", ")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => viewData(teacher.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
                >
                  View
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={5}
              className="px-6 py-10 text-center text-gray-500 text-sm"
            >
              {searchName
                ? "No matching teachers found"
                : "No teachers available"}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

       
    </>
  );
};
