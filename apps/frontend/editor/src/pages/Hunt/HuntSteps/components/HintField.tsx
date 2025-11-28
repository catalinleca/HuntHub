import { Stack, Typography } from '@mui/material';
import { FormTextArea, getFieldPath } from '@/components/form';

interface HintFieldProps {
  stepIndex: number;
}

const getHintFieldName = (stepIndex: number) => getFieldPath((h) => h.hunt.steps[stepIndex].hint);

export const HintField = ({ stepIndex }: HintFieldProps) => {
  const hintField = getHintFieldName(stepIndex);

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
        HINT (OPTIONAL)
      </Typography>

      <FormTextArea
        name={hintField}
        label="Hint"
        placeholder="If players get stuck, they can request this hint..."
        rows={2}
        helperText="This will be shown if a player requests help"
      />
    </Stack>
  );
};
