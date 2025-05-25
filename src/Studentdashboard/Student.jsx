import { Route, Routes } from "react-router-dom";
import { StudentProfile } from "./StudentProfile"

function Student () {
    return (
        <>
            <Routes>
                <Route path="/student" element={<StudentProfile/>} />
            </Routes>
        </>
    )
}

export default Student;