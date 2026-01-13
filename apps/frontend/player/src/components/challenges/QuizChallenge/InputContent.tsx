import React from 'react';
import { TextField } from '@mui/material';

interface InputContentProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}

export const InputContent = ({ value, onChange, disabled }: InputContentProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <TextField
      fullWidth
      label="Your answer"
      value={value}
      onChange={handleChange}
      disabled={disabled}
    />
  );
};