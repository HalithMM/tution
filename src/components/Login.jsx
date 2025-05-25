import React, { useEffect, useState } from "react";
import { Auth, db } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { Button, TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore"; 
import { ToastContainer, toast } from "react-toastify";
export const Login = () => {
  const navigate = useNavigate();
  const [loginDetail, setLoginDetails] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [registerDetials, setRegisterDetails] = useState({
    email: "",
    password: "",
  });
  const [register, setRegister] = useState(false);
  const [adminUsername, setAdminUserName] = useState([]);
  const [teacherUsername , setTeacherUsername] = useState([]);
  const [alignment , setAlignment] = useState(false);

  const handleAlignment = (e,value)=>{
    setAlignment(value);
  }
  const adminRef = async () => {
    const admin = collection(db, "Admin");
    try {
      const Extract = await getDocs(admin);
      const data = Extract.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      const username = data.map((doc) => doc.id);
      setAdminUserName(username);
      console.log(username);
    } catch (error) {
      console.log(error);
    }
  };

  const teacherRef = async () => {
    const teachRef = collection(db,"Teachers")
    try {
      const Extract = await getDocs(teachRef);
      const data = Extract.docs.map((doc)=>({...doc.data() , id:doc.id}))
      const teacherName = data.map(doc => doc.id);
      console.log(teacherName);
      setTeacherUsername(teacherName);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    adminRef();
    teacherRef();
  }, []);

  const accountHandle = () => {
    setRegister(true);
  };

  const registerHandler = (e) => {
    const { name, value } = e.target;
    setRegisterDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const changeHandler = (e) => {
    const { name, value } = e.target;
    setLoginDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const registerSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        Auth,
        registerDetials.email,
        registerDetials.password
      );
      await sendEmailVerification(userCredential.user);
      toast.success("Verification email sent! Please check your inbox.",{
        position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
});
      setRegister(false);
    } catch (error) {
      console.log(error);
    }
    console.log(registerDetials);
  };

  const loginsubmitHandler = async (e) => {
    e.preventDefault();
    try { 
      const userCredential = await signInWithEmailAndPassword(
        Auth,
        loginDetail.email,
        loginDetail.password
      ); 
      
      sessionStorage.setItem("didProperLogin", "true"); 
      
      if (!userCredential.user.emailVerified) {
        toast.error("Please verify your email first",{
          position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
});
        setRegister(true);
        return navigate("/login");
      }  
      if (adminUsername.includes(loginDetail.name)) {
        await updateDoc(doc(db, "Admin", loginDetail.name), {
          email: loginDetail.email,
        });
        toast.success("Admin Login Successful");
        return navigate("/admin/Dashboard");
      } 
      if (teacherUsername.includes(loginDetail.name)) {
        await updateDoc(doc(db, "Teachers", loginDetail.name), {
          email: loginDetail.email,
        });
        toast.success("Teacher Login Success");
        return navigate(`/teacher/Teacherprofile/${loginDetail.name}`);
      } 
      toast.error("User privileges not found");
      return navigate("/unauthorized");
      
    } catch (error) {
      console.error("Login error:", error);
      toast.error(`Register and Verify your Email `);
      navigate("/");
    }
  };
  return (
    <>
    <ToastContainer>
    </ToastContainer>
     <div className="flex flex-col md:flex-row min-h-screen bg-gray-50"> 
      <div className="w-full md:w-1/2 bg-blue-600 flex items-center justify-center p-8">
        <div className="text-white text-center">
          <h1 className="text-4xl font-bold mb-4">Tuition Management</h1>
          {register ? (
            <p className="text-xl">Welcome! Please Register to continue.</p>
          ) : (
            <p className="text-xl">Welcome back! Please login to continue.</p>
          )}
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        {register ? (
          <form
            onSubmit={registerSubmitHandler}
            className="w-full max-w-md bg-white rounded-lg shadow-md p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Register
            </h2>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Email
              </label>
              <TextField
                name="email"
                variant="outlined"
                value={registerDetials.email}
                onChange={registerHandler}
                type="email"
                size="small"
                fullWidth
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Password
              </label>
              <TextField
                name="password"
                variant="outlined"
                type="password"
                value={registerDetials.password}
                onChange={registerHandler}
                size="small"
                fullWidth
                placeholder="Enter password"
              />
            </div>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              className="py-2"
            >
              Register
            </Button>
          </form>
        ) : (
          <form
            onSubmit={loginsubmitHandler}
            className="w-full max-w-md bg-white rounded-lg shadow-md p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Login
            </h2>

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Name
              </label>
              <TextField
                required
                name="name"
                value={loginDetail.name}
                onChange={changeHandler}
                variant="outlined"
                type="text"
                size="small"
                fullWidth
                placeholder="Enter your name"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Email
              </label>
              <TextField
                required
                name="email"
                variant="outlined"
                value={loginDetail.email}
                onChange={changeHandler}
                type="email"
                size="small"
                fullWidth
                placeholder="Enter your email"
              />
            </div>
            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-gray-700 text-sm font-medium mb-1"
              >
                Password
              </label>
              <TextField
                required
                name="password"
                variant="outlined"
                type="password"
                value={loginDetail.password}
                onChange={changeHandler}
                size="small"
                fullWidth
                placeholder="Enter password"
              />
            </div>
            <Button
              type="submit"
              variant="contained"
              color="success"
              fullWidth
              className="py-2"
            >
              Login
            </Button>

            <div className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <a
                onClick={accountHandle}
                className="text-blue-600 hover:underline"
              >
                Register
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
    </>
  );
};
