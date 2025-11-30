import { Typography, Stack } from '@mui/material';
import { RepeatIcon } from '@phosphor-icons/react';
import { FormNumberInput, getFieldPath } from '@/components/form';
import * as S from '../StepSettings.styles';

interface MaxAttemptsSectionProps {
  stepIndex: number;
}

export const MaxAttemptsSection = ({ stepIndex }: MaxAttemptsSectionProps) => {
  const maxAttemptsPath = getFieldPath((h) => h.hunt.steps[stepIndex].maxAttempts);

  return (
    <S.SectionCard>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <RepeatIcon size={20} weight="duotone" />
          <Typography variant="smBold">Max Attempts</Typography>
        </Stack>

        <FormNumberInput
          name={maxAttemptsPath}
          label="Attempts"
          placeholder="3"
          helperText="Maximum number of attempts allowed"
        />
      </Stack>
    </S.SectionCard>
  );
};
