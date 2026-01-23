import { Stack, Typography } from '@mui/material';
import * as S from '../LoginPage.styles';

interface ProgressStepperProps {
  currentStep: 1 | 2;
}

export const ProgressStepper = ({ currentStep }: ProgressStepperProps) => (
  <Stack direction="row" alignItems="center" gap={2}>
    <S.StepCircle $isActive alignItems="center" justifyContent="center">
      1
    </S.StepCircle>
    <Typography variant="smMedium" color="text.primary">
      Sign in
    </Typography>
    <S.StepConnector />
    <S.StepCircle $isActive={currentStep === 2} alignItems="center" justifyContent="center">
      2
    </S.StepCircle>
    <Typography variant="smMedium" color={currentStep === 2 ? 'text.primary' : 'text.secondary'}>
      Ready
    </Typography>
  </Stack>
);
