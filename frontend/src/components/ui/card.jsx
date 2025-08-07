import { Card as MuiCard, CardContent as MuiCardContent, CardHeader as MuiCardHeader, Typography } from '@mui/material';

export const Card = ({ children, ...props }) => {
  return <MuiCard {...props}>{children}</MuiCard>;
};

export const CardContent = ({ children, ...props }) => {
  return <MuiCardContent {...props}>{children}</MuiCardContent>;
};

export const CardHeader = ({ children, title, ...props }) => {
  return (
    <MuiCardHeader
      title={title}
      {...props}
    />
  );
};

export const CardTitle = ({ children, ...props }) => {
  return (
    <Typography variant="h6" component="div" {...props}>
      {children}
    </Typography>
  );
};