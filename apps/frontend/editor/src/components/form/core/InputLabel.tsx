import React from 'react';
import { InputLabel as MuiInputLabel, InputLabelProps } from '@mui/material';

interface FormInputLabelProps extends InputLabelProps {
  children: React.ReactNode;
}

export const InputLabel = ({ children, ...props }: FormInputLabelProps) => {
  return <MuiInputLabel {...props}>{children}</MuiInputLabel>;
};
