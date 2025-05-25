import { Autocomplete, Button, MenuItem, Select, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { db } from '../config/firebase';
import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import moment from 'moment';
import { toast } from 'react-toastify';

export const Salary = ({onClose}) => {
  const [teacherData, setTeacherData] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [salaryDetails, setSalaryDetails] = useState({
      salaryAmount: "", Month: moment().format("DD-MM-YYYY"), Transaction: ""
  })
  const [month , setMonth] = useState(moment().format("MMMM-YYYY"))
  const teacherRef = collection(db, "Teachers");
  const teacherpaymentRef = collection(db,"payments")
  useEffect(() => {
    const unsubscribe = onSnapshot(teacherRef, (Extract) => {
      const teacher = Extract.docs.map((doc) => ({ 
        ...doc.data(), 
        id: doc.id 
      }));
      setTeacherData(teacher);
      console.log(teacher); // Maintains the original console.log
    });
  
    // Cleanup function to unsubscribe when component unmounts
    return () => unsubscribe();
  }, []);

  const salaryHandler = (e) => {
    const { name, value } = e.target;
    setSalaryDetails((prev => ({
      ...prev, [name]: value
    })))
  }

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const teacherSalaryRef = collection(db, "Teachers", selectedTeacher.teacherName , "salaryDetails");
      await addDoc(teacherSalaryRef, {
        Teachername: selectedTeacher.teacherName,
        salaryAmount: Number(salaryDetails.salaryAmount),
        Month: moment().format("DD-MM-YYYY"),
        Transaction: salaryDetails.Transaction
      }); 
      const paymentRef =  doc(teacherpaymentRef,month)
      const paymentDocRef = await getDoc(paymentRef);
      let temp = [];
      if (paymentDocRef.exists()) {
        temp = paymentDocRef.data().salary || [];
      } 
        temp.push({
          teacherName:selectedTeacher.teacherName,
          salaryAmount:Number(salaryDetails.salaryAmount)
        }) 
      await setDoc(doc(teacherpaymentRef,month),{salary:temp},{merge:true})
      console.log("Data saved",salaryDetails);
      setSelectedTeacher(null)
      setSalaryDetails({salaryAmount: "", Transaction: "", Month: moment().format("DD-MM-YYYY") });
      onClose();
      toast.success("Salary Dispursed successfully");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
    <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        Monthly Salary Updates
      </h1>
      <form onSubmit={submitHandler} className="space-y-6">
        {/* Teacher Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Teacher Name</label>
          <div className="w-full">
            <Autocomplete
              className="w-full"
              disablePortal
              value={selectedTeacher}
              onChange={(e, v) => setSelectedTeacher(v)}
              options={teacherData}
              getOptionLabel={(option) => option.teacherName || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Teacher"
                  required
                  className="w-full"
                />
              )}
            />
          </div>
        </div>
  
        {/* Salary Amount */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Salary Amount</label>
          <input
            type="text"
            name="salaryAmount"
            required
            value={salaryDetails.salaryAmount}
            onChange={salaryHandler}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Transaction Type */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Transaction Type</label>
          <select
            name="Transaction"
            required
            value={salaryDetails.Transaction || ''}
            onChange={salaryHandler}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="select Type">select type</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Account Transaction">Account Transaction</option>
          </select>
        </div>
  
        {/* Submit Button */}
        <div className="text-center">
          <button
            
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 w-full"
          >
            Submit Data
          </button>
        </div>
      </form>
    </div>
  </div>
  
  )
}
