import { TextField } from '@mui/material';

export const Textarea = ({ ...props }) => {
  return <TextField variant="outlined" multiline rows={4} fullWidth {...props} />;
};