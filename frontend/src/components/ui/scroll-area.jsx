import { Box } from '@mui/material';

export const ScrollArea = ({ children, ...props }) => {
  return (
    <Box 
      sx={{ 
        maxHeight: '400px', 
        overflow: 'auto',
        ...props.sx 
      }} 
      {...props}
    >
      {children}
    </Box>
  );
};