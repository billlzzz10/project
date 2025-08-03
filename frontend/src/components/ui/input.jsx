import { TextField } from '@mui/material';

export const Input = ({ ...props }) => {
  return <TextField variant="outlined" size="small" fullWidth {...props} />;
};