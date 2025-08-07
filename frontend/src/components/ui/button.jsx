import { Button as MuiButton } from '@mui/material';

export const Button = ({ children, variant = 'contained', ...props }) => {
  return (
    <MuiButton variant={variant} {...props}>
      {children}
    </MuiButton>
  );
};