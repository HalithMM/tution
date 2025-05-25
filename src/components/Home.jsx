import React, { useEffect, useState } from "react";
import GroupsIcon from "@mui/icons-material/Groups";
import PaymentsIcon from "@mui/icons-material/Payments";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import { Dialog, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { Studentform } from "./Studentform";
import { Teacherform } from "./Teacherform";
import { BillDetails } from "./BillDetails";
import { ClassDet } from "./ClassDet";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";
import { Salary } from "./Salary";
import GroupOffIcon from '@mui/icons-material/GroupOff';
import { Maintenance } from "./Maintenance";
import ClassManagement from "./StudentManagement ";
import Loader from "./Loader";
export const Home = () => {
  const [studentData , setStudentData] = useState([]);
  const [teacherData , setTeacherData] = useState([]);
  const [isStudentFormOpen, setStudentFormOpen] = useState(false); 
  const [isTeacherFormOpen , setTeacherFormOpen] = useState(false) 
  const [isFeeFormOpen , setFeeFormOpen] = useState(false) 
  const [isSalaryOpen , setSalaryOpen] = useState(false);
  const [ismaintenOpen , setmaintenOpen] = useState(false);
  const [classOpen,setClassOpen] = useState(false); 
  const studentRef = collection(db, "Students");
  const teacherRef = collection(db,"Teachers");
  const student = () => {
    try {
      const unsubscribeStudent = onSnapshot(studentRef, (snapshot) => {
        setStudentData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))); 
      });
      return unsubscribeStudent;
    } catch (error) {
      console.log(error);
    }
  };
  
  const teacher = () => {
    try {
      const unsubscribeTeacher = onSnapshot(teacherRef, (snapshot) => {
        setTeacherData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))); 
      });
      return unsubscribeTeacher;
    } catch (error) {
      console.log(error);
    }
  };
  
  useEffect(() => { 
    const unsubscribeStudent = student();
    const unsubscribeTeacher = teacher();
  
    // Cleanup function
    return () => {
      if (unsubscribeStudent) unsubscribeStudent();
      if (unsubscribeTeacher) unsubscribeTeacher();
    };
  }, []);
  const navigate = useNavigate();

  const openStudentForm = () => {
    setStudentFormOpen(true);
  };
  
  const closeStudentForm = () => {
    setStudentFormOpen(false);
  };

  const openteacherForm = () => {
    setTeacherFormOpen(true);
  }

  const closeteacherForm = () => {
    setTeacherFormOpen(false);
  }

  const openfeeForm = () => {
    setFeeFormOpen(true)
  }

  const closefeeForm = () => {
    setFeeFormOpen(false)
  }

  const openSalaryForm = () => {
    setSalaryOpen(true)
  }
  
  const closeSalaryForm = () => {
    setSalaryOpen(false)
  }

  const handleclassOpen = () => {
    setClassOpen(true)
  }

  const classOpenHandler = () => {
    setClassOpen(false)
  }

  const allStudents = () => {
    navigate('/admin/allstudents')
  }

  const allTeacher = () => {
    navigate('/admin/allTeachers')
  }

  const paymentsPage = () => {
    navigate('/admin/payment')
  }

  const dropOut = () => {
    navigate('/admin/dropoutStudents')
  }

  const report = () => {
    navigate('/admin/report')
  }
  
  const openMaintenform = () =>{
     setmaintenOpen(true)
  }

  const closeMaintenform = () => {
    setmaintenOpen(false)
  }

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="">
  //           <Loader/>
  //       </div>
  //     </div>
  //   );
    
  // }

  return (
    <>
   <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
  {/* Stats Section */}
  <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {[
      {
        title: "STUDENTS",
        icon: <GroupsIcon className="text-4xl text-blue-500" />,
        count: studentData.length,
        onClick: allStudents,
      },
      {
        title: "TEACHERS",
        icon: <SchoolIcon className="text-4xl text-emerald-500" />,
        count: teacherData.length,
        onClick: allTeacher,
      },
      {
        title: "PAYMENTS",
        icon: <PaymentsIcon className="text-3xl text-red-500" />,
        count: null,
        onClick: paymentsPage,
      },
      {
        title: "REPORTS",
        icon: <AssessmentIcon className="text-4xl text-purple-500" />,
        count: null,
        onClick: report,
      },
      {
        title: "DROPOUT STUDENTS",
        icon: <GroupOffIcon className="text-3xl text-red-500" />,
        count: null,
        onClick: dropOut,
      },
    ].map((item, index) => (
      <div
        key={index}
        onClick={item.onClick}
        className="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-300 cursor-pointer p-5 flex flex-col items-center justify-center text-center"
      >
        <div className="mb-3">{item.icon}</div>
        <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
          {item.title}
        </h3>
        {item.count !== null && (
          <p className="text-lg font-bold text-gray-600 mt-1">{item.count}</p>
        )}
      </div>
    ))}
  </section>

  {/* Main Content Section */}
  <div className="flex flex-col lg:flex-row gap-6">
    {/* Sidebar / Quick Actions */}
    <aside className="w-full lg:w-72 bg-white rounded-xl shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      {[
        { label: "Add Student", icon: <PersonAddIcon className="text-blue-500" />, action: openStudentForm },
        { label: "Add Teacher", icon: <SchoolIcon className="text-green-500" />, action: openteacherForm },
        { label: "Fee Form", icon: <AddIcon className="text-purple-500" />, action: openfeeForm },
        { label: "Salary Updates", icon: <AddIcon className="text-purple-500" />, action: openSalaryForm },
        { label: "Create Class", icon: <AddIcon className="text-purple-500" />, action: handleclassOpen },
        { label: "Maintenance", icon: <AddIcon className="text-purple-500" />, action: openMaintenform },
      ].map((item, index) => (
        <div
          key={index}
          onClick={item.action}
          className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
        >
          {item.icon}
          <span className="text-sm font-medium text-gray-700">{item.label}</span>
        </div>
      ))}
    </aside>

    {/* Main Panel */}
    <main className="flex-1 bg-white rounded-xl shadow-sm p-6 overflow-hidden">
      <ClassDet />
    </main>
  </div>

  {/* Notification Area */}
  <footer className="mt-8 text-center text-gray-500 text-sm">
    <h1 className="font-medium">Notification Area</h1>
  </footer>
</div>

    <Dialog open={isStudentFormOpen} onClose={closeStudentForm}>
        <DialogContent>
            <Studentform onClose={closeStudentForm}/>
        </DialogContent>
    </Dialog>
    <Dialog open={isTeacherFormOpen} onClose={closeteacherForm}>
        <DialogContent>
            <Teacherform onClose={closeteacherForm}/>
        </DialogContent>
    </Dialog>
    <Dialog open={isFeeFormOpen} onClose={closefeeForm}>
        <DialogContent>
             <BillDetails onClose={closefeeForm}/>
        </DialogContent>
    </Dialog>
    <Dialog open={isSalaryOpen} onClose={closeSalaryForm} >
      <DialogContent>
          <Salary onClose={closeSalaryForm}/>
      </DialogContent>
    </Dialog>
    <Dialog open={ismaintenOpen} onClose={closeMaintenform} >
      <DialogContent>
          <Maintenance onClose={closeMaintenform}/>
      </DialogContent>
    </Dialog>
    <Dialog open={classOpen} onClose={classOpenHandler} >
      <DialogContent>
          <ClassManagement onClose = {classOpenHandler}/>
      </DialogContent>
    </Dialog>
    </>
    
  );
};