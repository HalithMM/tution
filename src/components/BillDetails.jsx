import {
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Autocomplete,
} from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { toast } from "react-toastify";

export const BillDetails = ({onClose}) => {
  const [month , setMonth] = useState(moment().format("MMMM-YYYY"));
  
  const [billDetail, setBillDetail] = useState({
    name: "",
    amount: "",
    date: moment().format("DD-MM-YYYY"),
    paymentType: "cash",
    feeStatus: "unpaid",
  });
  const [id, setID] = useState(1);
  const [fetchStudent, setFetchStudent] = useState([null]);

  const studentRef = collection(db, "Students");
  const paymentRef = collection(db ,"payments");
  const handleBillDetails = (e) => {
    const { name, value } = e.target;
    setBillDetail((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // let temp = [];
  // let names = billDetail.name;
  // temp.push(names)

const submitBill = async (e) => {
  e.preventDefault();
  try {
    const newBillRef = doc(collection(db, 'Students', billDetail.name, 'feeDetail'));
    const paymentDocRef = doc(paymentRef, month);

    const getPaymentData = await getDoc(paymentDocRef);
    let temp = [];

    if (getPaymentData.exists()) {
      temp = getPaymentData.data().payments || []
    }
    temp.push({name:billDetail.name,amount:Number(billDetail.amount)})
    await setDoc(doc(paymentRef,month),{payments:temp},{merge:true})

    await setDoc(newBillRef, {
      ...billDetail,
      amount: Number(billDetail.amount),
      date: moment().format("DD-MM-YYYY")
    });

    if (billDetail.feeStatus) {
      await updateDoc(doc(db, 'Students', billDetail.name), {
        status: billDetail.feeStatus,
      });
    }

    setBillDetail({
      name: "",
      amount: "",
      paymentType: "cash",
      feeStatus: "unpaid",
    });
    onClose();
    toast.success("Data saved successfully");
  } catch (error) {
    console.error("Error saving bill:", error);
    toast.error("Something Went wrong")
  }
};


  useEffect(() => {
    const unsubscribeStudent = onSnapshot(studentRef, (snap) => {
      const student = snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setFetchStudent(student);
      console.log(student);
    });
    console.log(month);
    return () => unsubscribeStudent();
    
  }, []);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ mb: 3, fontWeight: "bold" }}
        >
          Bill Payment Form
        </Typography>

        <form onSubmit={submitBill}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Autocomplete
                  disablePortal
                  sx={{ width: 230 }}
                  onChange={(e, v) => {
                    setBillDetail((prev) => ({
                      ...prev,
                      name: v ? v.id : "",
                    }));
                  }}
                  options={fetchStudent || []}
                  getOptionLabel={(student) => student.studentName || ""}
                  value={
                    fetchStudent?.find(
                      (student) => student?.id === billDetail.name
                    ) || null
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Select Student" required />
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <TextField
                  label="Amount"
                  variant="outlined"
                  type="number"
                  name="amount"
                  value={billDetail.amount}
                  onChange={handleBillDetails}
                  required
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  sx={{ width: 230 }}
                  label="Payment Method"
                  name="paymentType"
                  value={billDetail.paymentType}
                  onChange={handleBillDetails}
                  required
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="upi">UPI</MenuItem>
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="netbanking">Net Banking</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  sx={{ width: 230 }}
                  label="Payment Status"
                  name="feeStatus"
                  value={billDetail.feeStatus}
                  onChange={handleBillDetails}
                  required
                >
                  <MenuItem value="unpaid">Unpaid</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="partial">Partial Payment</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: "bold",
                    backgroundColor: "#1976d2",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    },
                  }}
                >
                  Submit Bill
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};
