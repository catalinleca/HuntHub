import { Typography, Divider, Stack } from '@mui/material';

interface StepHeaderProps {
  stepIndex: number;
}

/**
 * Step header - displays step number and section title
 */
export const StepHeader = ({ stepIndex }: StepHeaderProps) => {
  return (
    <>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Step {stepIndex + 1}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure this hunt step
      </Typography>

      <Divider sx={{ mb: 3 }} />
    </>
  );
};
