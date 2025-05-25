import { collection, doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { db } from '../config/firebase';
import moment from 'moment';
import { toast } from 'react-toastify';

export const Maintenance = ({onClose}) => {
  const currentMonth = moment(new Date).format("MMMM-YYYY")
  const [maintenance, setMaintenance] = useState({
    Rent: "", Electricity: "", Internet: "", Stationery: "",
    Repairs: "", Marketing: "", Software: "", Supplies: "",Other:"",
  });

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setMaintenance(prev => ({
      ...prev,
      [name]: value
    }));
  }; 

  const maintanancepaymentRef = collection(db, "payments");
  
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const paymentRef = doc(maintanancepaymentRef, currentMonth);
      const paymentDoc = await getDoc(paymentRef); 
      let temp = [];
  
      if (paymentDoc.exists()) { 
        const data = paymentDoc.data();
        temp = data.Maintenance || [];
      } 
      temp.push({
        Rent: Number(maintenance.Rent),
        Electricity: Number(maintenance.Electricity),
        Internet: Number(maintenance.Internet),
        Stationery: Number(maintenance.Stationery),
        Repairs: Number(maintenance.Repairs),
        Marketing: Number(maintenance.Marketing),
        Software: Number(maintenance.Software),
        Supplies: Number(maintenance.Supplies),
        Date:new Date(),
      });
      
      await setDoc(paymentRef, { Maintenance: temp }, { merge: true });
  
      console.log("Maintenance data submitted:", maintenance);
      toast.success("Maintenance data submitted");
      onClose();
  
    } catch (error) {
      console.error("Error submitting maintenance payment:", error);
    }
  };
  

  return (
    <div className="max-w-3xl mx-auto  bg-white rounded-2xl  ">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Maintenance Form</h1>
      <h1>Total:</h1>
      <form className="space-y-5" onSubmit={submitHandler}>
        {[
          { label: 'Rent', name: 'Rent' },
          { label: 'Electricity', name: 'Electricity' },
          { label: 'Internet', name: 'Internet' },
          { label: 'Stationery', name: 'Stationery' },
          { label: 'Repairs', name: 'Repairs' },
          { label: 'Marketing', name: 'Marketing' },
          { label: 'Software', name: 'Software' },
          { label: 'Cleaning Supplies', name: 'Supplies' },
          {label:'Other' , name: 'Other'}
        ].map((field, index) => (
          <div key={index} className="flex flex-col md:flex-row md:items-center gap-4">
            <label className="w-48 font-medium text-gray-700">{field.label}:</label>
            <input
              type="number"
              name={field.name}
              value={maintenance[field.name]}
              onChange={changeHandler}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div className="text-center mt-6">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-md transition"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};
