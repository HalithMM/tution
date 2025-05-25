import { Routes, Route } from "react-router-dom";
import { StudentPreviewSection } from "./StudentPreview"; 
import { Home } from "./Home";
import { Allstudents } from "./Allstudents";
import { Allteacher } from "./Allteacher";
import { Payment } from "./Payment";
import { TeacherDet } from "./TeacherDet";
import { Dropout } from "./Dropout";
import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { Protectedroute } from "../Protection/Protectedroute";
import { ClassDashboard } from "./ClassDashboard";
import { Report } from "./Report";

function App() {
  const [fetchData, setFetchData] = useState([]);

  useEffect(() => {
    const fetchDrop = () => {
      const dropRef = collection(db, "Discontinue");
      const unsubscribe = onSnapshot(dropRef, (snapshot) => {
        try {
          setFetchData(
            snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
          );
        } catch (error) {
          console.log(error);
        }
      });
  
      // Return the unsubscribe function to clean up the listener
      return unsubscribe;
    };
  
    const unsubscribe = fetchDrop();
  
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <Routes> 
      <Route path="Dashboard" element={<Protectedroute><Home /></Protectedroute>} />
      <Route path="class/:className" element={<Protectedroute><ClassDashboard /></Protectedroute>} />
      <Route path="student/:studentID" element={<Protectedroute><StudentPreviewSection /></Protectedroute>} />
      <Route path="teacher/:teacherId" element={<Protectedroute><TeacherDet /></Protectedroute>} />
      <Route path="allstudents" element={<Protectedroute><Allstudents /></Protectedroute>} />
      <Route path="allTeachers" element={<Protectedroute><Allteacher /></Protectedroute>} />
      <Route path="report" element={<Protectedroute><Report/></Protectedroute>} />
      <Route path="dropoutStudents" element={<Protectedroute><Dropout fetchData={fetchData} /></Protectedroute>} />
      <Route path="payment" element={<Protectedroute><Payment /></Protectedroute>} />
    </Routes>
  );
}

export default App;