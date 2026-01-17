import React from 'react';
import { TextField, InputLabel, Stack } from '@mui/material';

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
    <Stack gap={1}>
      <InputLabel>Your answer</InputLabel>
      <TextField
        fullWidth
        value={value}
        onChange={handleChange}
        placeholder="Type your answer..."
        disabled={disabled}
      />
    </Stack>
  );
};
