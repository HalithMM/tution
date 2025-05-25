import React from "react";
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Studentform } from "./Studentform";
import { Teacherform } from "./Teacherform";
import { Class } from "./Class";
import { BillDetails } from "./BillDetails";
import { ClassDet } from "./ClassDet";

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };
  
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

export const Admin = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Student" {...a11yProps(0)} />
            <Tab label="Teacher" {...a11yProps(1)} />
            <Tab label="Class" {...a11yProps(2)} />
            <Tab label="Fee" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <Studentform/>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
           <Teacherform/>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
           <ClassDet />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={3}>
           <BillDetails />
        </CustomTabPanel>
      </Box>
    </>
  );
};
