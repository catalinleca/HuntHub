import { Typography, Stack } from '@mui/material';
import { LightbulbIcon } from '@phosphor-icons/react';
import { FormTextArea, getFieldPath } from '@/components/form';
import * as S from '../StepSettings.styles';

interface HintSectionProps {
  stepIndex: number;
}

export const HintSection = ({ stepIndex }: HintSectionProps) => {
  const hintPath = getFieldPath((h) => h.hunt.steps[stepIndex].hint);

  return (
    <S.SectionCard>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LightbulbIcon size={20} weight="duotone" />
          <Typography variant="smBold">Hint</Typography>
        </Stack>

        <FormTextArea
          name={hintPath}
          label="Hint Text"
          placeholder="Look for the red door on the left side of the building..."
          rows={3}
        />
      </Stack>
    </S.SectionCard>
  );
};
