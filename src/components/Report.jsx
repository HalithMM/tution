import { Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Box } from '@mui/material'
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react'
import { db } from '../config/firebase';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Loader from './Loader';
// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement
);

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const Report = () => {
    const [paymentDet, setPaymentDet] = useState([]);
    const paymentRef = collection(db, "payments");
    const [loading, setLoading] = useState(true); // State to manage loading status
    // State for date range filter
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [dateFilterType, setDateFilterType] = useState('none'); // 'none', 'year', 'range'
    
    const fetchReport = useCallback(() => {
        try {
          setLoading(true);
          const unsubscribe = onSnapshot(paymentRef, (Extract) => {
            const Data = Extract.docs.map((doc) => ({ 
              ...doc.data(), 
              id: doc.id,
              docName: doc.id
            }));
            setPaymentDet(Data);
            setLoading(false);
          }, (error) => {
            console.error("Error fetching payments:", error);
            setLoading(false); // Make sure to set loading to false on error too
          });
          
          return unsubscribe;
        } catch (error) {
          console.error("Error setting up listener:", error);
          setLoading(false);
          return null; // Return null if there's an error
        }
      }, []);
      
      useEffect(() => {
        const unsubscribe = fetchReport();
        return () => {
          if (unsubscribe) unsubscribe();
        };
      }, [fetchReport]);

    // Calculate totals for a single month's data
    const calculateMonthTotals = (monthData) => {
        const feeCollected = Array.isArray(monthData.payments) ? 
            monthData.payments.reduce((sum, payment) => sum + (Number(payment?.amount) || 0), 0) : 0;
        
        const salaryDisbursed = Array.isArray(monthData.salary) ? 
            monthData.salary.reduce((sum, salary) => sum + (Number(salary?.salaryAmount) || 0), 0) : 0;
        
        let maintenanceTotal = 0;
        if (monthData.Maintenance && Array.isArray(monthData.Maintenance)) {
            monthData.Maintenance.forEach((maintenanceItem) => {
                if (maintenanceItem && typeof maintenanceItem === 'object') {
                    Object.entries(maintenanceItem).forEach(([key, value]) => {
                        if (typeof value === 'number' && key !== 'Date') {
                            maintenanceTotal += value;
                        }
                    });
                }
            });
        }
        
        const netProfit = feeCollected - salaryDisbursed - maintenanceTotal;
        
        // Parse month and year from the document name if not available
        let monthName = monthData.id;
        let year = monthData.year || 2025;
        
        // Try to extract month and year from docName if it follows a pattern like "January_2023"
        if (monthData.docName) {
            const parts = monthData.docName.split('_');
            if (parts.length >= 2) {
                const possibleMonth = parts[0];
                const possibleYear = parseInt(parts[1]);
                
                if (months.includes(possibleMonth)) {
                    monthName = possibleMonth;
                }
                if (!isNaN(possibleYear)) {
                    year = possibleYear;
                }
            }
        }
        
        return {
            feeCollected,
            salaryDisbursed,
            maintenanceTotal,
            netProfit,
            monthName,
            year,
            docName: monthData.docName || monthData.id,
            // Add a date object for easier filtering
            date: new Date(year, months.indexOf(monthName))
        };
    };

    // Prepare all months data
    const allMonthsData = paymentDet.map(calculateMonthTotals).sort((a, b) => {
        // Sort by date
        return a.date - b.date;
    });

    // Filter months based on selected date range
    const filteredMonthsData = allMonthsData.filter(monthData => {
        if (dateFilterType === 'none') return true;
        if (dateFilterType === 'year') return monthData.year === selectedYear;
        if (dateFilterType === 'range') {
            if (!startDate || !endDate) return true;
            return monthData.date >= startDate && monthData.date <= endDate;
        }
        return true;
    });

    // Get unique years for year selector
    const uniqueYears = [...new Set(allMonthsData.map(item => item.year))].sort();

    // Aggregate data by year
    const yearlyData = allMonthsData.reduce((acc, monthData) => {
        const year = monthData.year;
        if (!acc[year]) {
            acc[year] = {
                year,
                feeCollected: 0,
                salaryDisbursed: 0,
                maintenanceTotal: 0,
                netProfit: 0,
                monthCount: 0
            };
        }
        acc[year].feeCollected += monthData.feeCollected;
        acc[year].salaryDisbursed += monthData.salaryDisbursed;
        acc[year].maintenanceTotal += monthData.maintenanceTotal;
        acc[year].netProfit += monthData.netProfit;
        acc[year].monthCount += 1;
        return acc;
    }, {});

    // Convert to array and sort by year
    const yearlyDataArray = Object.values(yearlyData).sort((a, b) => a.year - b.year);

    // Find the most recent month with data
    const latestMonthData = allMonthsData.length > 0 
        ? allMonthsData[allMonthsData.length - 1]
        : {
            feeCollected: 0,
            salaryDisbursed: 0,
            maintenanceTotal: 0,
            netProfit: 0,
            docName: 'No Data',
            monthName: 'No Data',
            year: new Date().getFullYear()
        };

    // Create pie chart data for the latest month
    const latestMonthPieData = {
        labels: ['Fee Collected', 'Salary Disbursed', 'Maintenance', 'Net Profit'],
        datasets: [
            {
                label: 'Amount',
                data: [
                    latestMonthData.feeCollected,
                    latestMonthData.salaryDisbursed,
                    latestMonthData.maintenanceTotal,
                    latestMonthData.netProfit
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    // Create bar chart data for filtered documents
    const monthlyComparisonBarData = {
        labels: filteredMonthsData.map(month => `${month.monthName}  `),
        datasets: [
            {
                label: 'Net Profit',
                data: filteredMonthsData.map(month => month.netProfit),
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
            },
        ],
    };

    // Create line chart data for yearly comparison
    const yearlyComparisonLineData = {
        labels: yearlyDataArray.map(yearData => yearData.year),
        datasets: [
            {
                label: 'Total Net Profit',
                data: yearlyDataArray.map(yearData => yearData.netProfit),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.1)',
                tension: 0.3,
                fill: true
            }
        ],
    };

    // Check if there's any data to show in charts
    const hasLatestMonthData = latestMonthData.feeCollected !== 0 || 
                             latestMonthData.salaryDisbursed !== 0 || 
                             latestMonthData.maintenanceTotal !== 0;
    const hasMonthlyData = filteredMonthsData.length > 0;
    const hasYearlyData = yearlyDataArray.length > 0;

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
        <div className='min-h-screen p-4'>
            <h1 className='text-2xl text-center font-semibold mb-4'>Financial Report</h1>
            <Divider className='mb-6' />
            
            {/* Detailed Table */}
            <div className='bg-white p-4 rounded-lg shadow-md mb-8'>
                <h2 className='text-xl font-semibold mb-4'>Detailed Financial Data</h2>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow> 
                                <TableCell>Month</TableCell>
                                <TableCell>Year</TableCell>
                                <TableCell>Fee Collected</TableCell>
                                <TableCell>Salary Disbursed</TableCell>
                                <TableCell>Maintenance</TableCell>
                                <TableCell>Net Profit</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allMonthsData.map((monthData, index) => (
                                <TableRow key={index}>
                                    <TableCell>{monthData.docName}</TableCell> 
                                    <TableCell>{monthData.year}</TableCell>
                                    <TableCell>{monthData.feeCollected.toLocaleString()}</TableCell>
                                    <TableCell>{monthData.salaryDisbursed.toLocaleString()}</TableCell>
                                    <TableCell>{monthData.maintenanceTotal.toLocaleString()}</TableCell>
                                    <TableCell 
                                        style={{ 
                                            color: monthData.netProfit < 0 ? 'red' : 'green',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {monthData.netProfit.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            {/* Latest Month Financial Breakdown */}
            <div className='mb-8 bg-white p-4 rounded-lg shadow-md'>
                <h2 className='text-xl font-semibold mb-4'>{latestMonthData.monthName}   Financial Breakdown</h2>
                {hasLatestMonthData ? (
                    <div className='h-80'>
                        <Pie 
                            data={latestMonthPieData} 
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    title: {
                                        display: true,
                                        text: `${latestMonthData.monthName}  Financial Distribution`,
                                        font: {
                                            size: 16
                                        }
                                    },
                                },
                                maintainAspectRatio: false,
                            }} 
                        />
                    </div>
                ) : (
                    <p className='text-center py-8 text-gray-500'>No data available for {latestMonthData.monthName}  </p>
                )}
            </div>
                
            {/* Monthly Comparison Bar Chart */}
            <div className='mb-8 bg-white p-4 rounded-lg shadow-md'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-semibold'>Monthly Financial Comparison</h2>
                    <div className='flex items-center space-x-4'>
                        <TextField
                            select
                            label="Filter Type"
                            value={dateFilterType}
                            onChange={(e) => setDateFilterType(e.target.value)}
                            size="small"
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem  value="none">No Filter</MenuItem>
                            <MenuItem value="year">By Year</MenuItem>
                            <MenuItem value="range">Date Range</MenuItem>
                        </TextField>
                        
                        {dateFilterType === 'year' && (
                            <TextField
                                select
                                label="Select Year"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                size="small"
                                sx={{ minWidth: 120 }}
                            >
                                {uniqueYears.map(year => (
                                    <MenuItem key={year} value={year}>{year}</MenuItem>
                                ))}
                            </TextField>
                        )}
                        
                        {dateFilterType === 'range' && (
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <DatePicker
                                        label="Start Date"
                                        value={startDate}
                                        onChange={(newValue) => setStartDate(newValue)}
                                        renderInput={(params) => <TextField {...params} size="small" sx={{ width: 150 }} />}
                                        views={['year', 'month']}
                                        openTo="year"
                                    />
                                    <span>to</span>
                                    <DatePicker
                                        label="End Date"
                                        value={endDate}
                                        onChange={(newValue) => setEndDate(newValue)}
                                        renderInput={(params) => <TextField {...params} size="small" sx={{ width: 150 }} />}
                                        views={['year', 'month']}
                                        openTo="year"
                                        minDate={startDate}
                                    />
                                </Box>
                            </LocalizationProvider>
                        )}
                    </div>
                </div>
                
                {hasMonthlyData ? (
                    <div className='h-96'>
                        <Bar 
                            data={monthlyComparisonBarData} 
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    title: {
                                        display: true,
                                        text: 'Monthly Financial Metrics',
                                        font: {
                                            size: 16
                                        }
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
                                            }
                                        }
                                    }
                                },
                                maintainAspectRatio: false,
                                scales: {
                                    x: {
                                        stacked: false,
                                    },
                                    y: {
                                        stacked: false,
                                        beginAtZero: false,
                                        ticks: {
                                            callback: function(value) {
                                                return value.toLocaleString();
                                            }
                                        }
                                    }
                                }
                            }} 
                        />
                    </div>
                ) : (
                    <p className='text-center py-8 text-gray-500'>
                        {dateFilterType === 'range' && startDate && endDate 
                            ? `No data available between ${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} and ${endDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                            : 'No monthly data available'}
                    </p>
                )}
            </div>

            {/* Yearly Comparison Line Chart */}
            <div className='mb-8 bg-white p-4 rounded-lg shadow-md'>
                <h2 className='text-xl font-semibold mb-4'>Yearly Financial Comparison</h2>
                {hasYearlyData ? (
                    <div className='h-96'>
                        <Line 
                            data={yearlyComparisonLineData} 
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    title: {
                                        display: true,
                                        text: 'Yearly Financial Trends',
                                        font: {
                                            size: 16
                                        }
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                return `${context.dataset.label}: ${context.raw.toLocaleString()}`;
                                            }
                                        }
                                    }
                                },
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: false,
                                        ticks: {
                                            callback: function(value) {
                                                return value.toLocaleString();
                                            }
                                        }
                                    }
                                }
                            }} 
                        />
                    </div>
                ) : (
                    <p className='text-center py-8 text-gray-500'>No yearly data available</p>
                )}
            </div> 
        </div>
    );
};