import { Route, Routes } from "react-router-dom"; 
import { Teacherprofile } from "./Teachherprofile";
import { Protectedroute } from "../Protection/Protectedroute";

function Teacher() { 
  return (
    <Routes>
      <Route path="/Teacherprofile/:name" element={ <Protectedroute>  <Teacherprofile/> </Protectedroute>}/> 
    </Routes>  
  );
}

export default Teacher;
