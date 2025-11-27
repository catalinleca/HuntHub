import { Stack, Divider, Typography } from '@mui/material';
import { FormInput, FormTextArea, FormCheckbox, getFieldPath } from '@/components/form';
import { StepHeader, LocationFields, HintField } from './components';

interface ClueInputProps {
  stepIndex: number;
}

const getClueFieldNames = (stepIndex: number) => ({
  title: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.clue.title),
  description: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.clue.description),
});

export const ClueInput = ({ stepIndex }: ClueInputProps) => {
  const fields = getClueFieldNames(stepIndex);

  return (
    <Stack spacing={3}>
      <StepHeader stepIndex={stepIndex} />

      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
        BASIC INFORMATION
      </Typography>

      <FormInput
        name={fields.title}
        label="Step Title"
        placeholder="Welcome to Downtown"
        required
      />

      <FormTextArea
        name={fields.description}
        label="Description"
        placeholder="Start your journey at the historic fountain in the town square..."
        rows={4}
      />

      {/* TODO: Remove - just testing FormCheckbox */}
      <FormCheckbox
        name={`hunt.steps.${stepIndex}.isOptional`}
        label="This step is optional"
      />

      <Divider sx={{ my: 2 }} />

      <LocationFields stepIndex={stepIndex} />

      <Divider sx={{ my: 2 }} />

      <HintField stepIndex={stepIndex} />
    </Stack>
  );
};
