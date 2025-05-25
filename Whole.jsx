import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./src/components/App";
import { Login } from "./src/components/Login";
import Teacher from "./src/Teacherdashboard/Teacher";
import { Unauthorized } from "./src/Protection/Unauthorized";
import Student from "./src/Studentdashboard/Student";

function Whole() {
  return (
    <Router>
      <Routes> 
        <Route path="/" element={<Login />} />
        <Route path="/unauthorized" element= {<Unauthorized/>} />
        <Route path="/admin/*" element={<App />} />
        <Route path="/teacher/*" element={<Teacher />} />
        <Route path="/student/*" element={<Student />} />
      </Routes>
    </Router>
  );
}

export default Whole;
