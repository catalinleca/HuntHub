import type { ReactNode } from 'react';
import { Stack } from '@mui/material';

interface StepIndicatorsProps {
  children: ReactNode;
}

export const StepIndicators = ({ children }: StepIndicatorsProps) => {
  return (
    <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ mb: 1 }}>
      {children}
    </Stack>
  );
};
