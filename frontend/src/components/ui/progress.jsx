import { LinearProgress } from '@mui/material';

export const Progress = ({ value, ...props }) => {
  return <LinearProgress variant="determinate" value={value} {...props} />;
};