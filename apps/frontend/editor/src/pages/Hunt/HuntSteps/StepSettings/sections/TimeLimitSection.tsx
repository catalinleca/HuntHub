import { Typography, Stack } from '@mui/material';
import { TimerIcon } from '@phosphor-icons/react';
import { FormNumberInput, getFieldPath } from '@/components/form';
import * as S from '../StepSettings.styles';

interface TimeLimitSectionProps {
  stepIndex: number;
}

export const TimeLimitSection = ({ stepIndex }: TimeLimitSectionProps) => {
  const timeLimitPath = getFieldPath((h) => h.hunt.steps[stepIndex].timeLimit);

  return (
    <S.SectionCard>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TimerIcon size={20} weight="duotone" />
          <Typography variant="smBold">Time Limit</Typography>
        </Stack>

        <FormNumberInput
          name={timeLimitPath}
          label="Time (seconds)"
          placeholder="60"
          helperText="Time players have to complete this step"
        />
      </Stack>
    </S.SectionCard>
  );
};
