import { Chip } from '@mui/material';

export const Badge = ({ children, variant = 'filled', ...props }) => {
  return <Chip label={children} variant={variant} size="small" {...props} />;
};