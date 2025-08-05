import { Tabs as MuiTabs, Tab, Box, Typography } from '@mui/material';
import { useState } from 'react';

export const Tabs = ({ children, defaultValue, ...props }) => {
  const [value, setValue] = useState(defaultValue || 0);
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box {...props}>
      {children}
    </Box>
  );
};

export const TabsList = ({ children, ...props }) => {
  return (
    <MuiTabs {...props}>
      {children}
    </MuiTabs>
  );
};

export const TabsTrigger = ({ children, value, ...props }) => {
  return <Tab label={children} value={value} {...props} />;
};

export const TabsContent = ({ children, value, ...props }) => {
  return (
    <Box role="tabpanel" {...props}>
      {children}
    </Box>
  );
};