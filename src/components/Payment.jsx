import { Button, IconButton } from "@mui/material";
import { collection, doc, onSnapshot } from "firebase/firestore";
import moment from "moment";
import { useCallback, useEffect, useState } from "react"; 
import { db } from "../config/firebase";
import Loader from "./Loader";

export const Payment = () => {
  const [isMonth, setMonth] = useState(moment().format("MMMM-YYYY"));
  const [fetchPayment, setFetchPayment] = useState({});
  const [loading, setLoading] = useState(true);

  const dateHandler = (e) => {
    const formatDate = moment(e.target.value, "YYYY-MM").format("MMMM-YYYY");
    setMonth(formatDate);
  };

  const paymentRef = doc(db, "payments", isMonth);
  
  useEffect(() => {
    setLoading(true); // Set loading to true before fetching data
    if (!isMonth) return;

    const unSubscribe = onSnapshot(paymentRef, (snap) => {
      if (snap.exists()) {
        const Extract = snap.data();
        console.log(Extract);
        setFetchPayment(Extract);
        setLoading(false); // Set loading to false once data is fetched 
      } else {
        console.log("No data Found in Month");
        setFetchPayment({});
        setLoading(false);
      }
    });
    
    return () => unSubscribe();
  }, [isMonth]);

  // Move all hook calls to the top level (no conditional calls)
  const calcTotal = useCallback(() => {
    let totalfee = 0;
    if (Array.isArray(fetchPayment.payments)) {
      fetchPayment.payments.forEach((payment) => {
        totalfee += Number(payment?.amount) || 0;
      });
    }
    return totalfee;
  }, [fetchPayment]);

  const calcSalary = useCallback(() => {
    let totalSalary = 0;
    if (Array.isArray(fetchPayment.salary)) {
      fetchPayment.salary.forEach((salary) => {
        totalSalary += Number(salary?.salaryAmount) || 0;
      });
    }
    return totalSalary;
  }, [fetchPayment]);

  const calcMaintenance = useCallback(() => {
    let total = 0;
    
    if (fetchPayment.Maintenance && Array.isArray(fetchPayment.Maintenance)) {
      fetchPayment.Maintenance.forEach((maintenanceItem) => {
        if (maintenanceItem && typeof maintenanceItem === 'object') { 
          Object.entries(maintenanceItem).forEach(([key, value]) => {
            if (typeof value === 'number' && key !== 'Date') {
              total += value;
            }
          });
        }
      });
      console.log("Calculated Maintenance Total:", total);
    }
    
    return total;
  }, [fetchPayment]);

  const calcProfit = useCallback(() => {
    return calcTotal() - calcSalary() - calcMaintenance();
  }, [calcTotal, calcSalary, calcMaintenance]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with Month Picker */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payment Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Financial overview for your institution</p>
        </div>
        <div className="relative w-full md:w-auto">
          <input
            type="month"
            value={moment(isMonth, "MMMM-YYYY").format("YYYY-MM")}
            onChange={dateHandler}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 pl-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          <svg 
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Fee Collected */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Fee Collected</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">₹{calcTotal()}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>All payments received</span>
          </div>
        </div>
    
        {/* Total Salary Paid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Salary Paid</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">₹{calcSalary()}</p>
            </div>
            <div className="p-3 rounded-lg bg-yellow-50">
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Monthly payroll</span>
          </div>
        </div>
    
        {/* Maintenance Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Maintenance Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">₹{calcMaintenance()}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Facility costs</span>
          </div>
        </div>
    
        {/* Profit */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Net Profit</p>
              <p className="text-2xl font-bold text-green-600 mt-1">₹{calcProfit()}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>After all expenses</span>
          </div>
        </div>
      </div>
    
      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fees Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Fees Details
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {fetchPayment?.payments?.map((payment, id) => (
              <div key={id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition">
                <div>
                  <p className="font-medium text-gray-800">{payment.name}</p>
                  <p className="text-sm text-gray-500">Payment received</p>
                </div>
                <span className="font-semibold text-blue-600">₹{payment.amount}</span>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-gray-600">Total collected</span>
            <span className="font-bold text-blue-700">₹{calcTotal()}</span>
          </div>
        </div>
    
        {/* Salary Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Salary Details
            </h2>
          </div>
          <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
            {fetchPayment?.salary?.map((salary, id) => (
              <div key={id} className="px-6 py-3 flex justify-between items-center hover:bg-gray-50 transition">
                <div>
                  <p className="font-medium text-gray-800">{salary.teacherName}</p>
                  <p className="text-sm text-gray-500">Salary disbursed</p>
                </div>
                <span className="font-semibold text-yellow-600">₹{salary.salaryAmount}</span>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-gray-600">Total paid</span>
            <span className="font-bold text-yellow-700">₹{calcSalary()}</span>
          </div>
        </div> 
      </div>
    </div>
  );
};