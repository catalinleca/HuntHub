import { Stack, Divider, Typography } from '@mui/material';
import { FormInput, FormTextArea, getFieldPath } from '@/components/form';
import { StepHeader, LocationFields, HintField } from './components';

interface TaskInputProps {
  stepIndex: number;
}

const getTaskFieldNames = (stepIndex: number) => ({
  title: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.task.title),
  instructions: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.task.instructions),
  aiInstructions: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.task.aiInstructions),
});

export const TaskInput = ({ stepIndex }: TaskInputProps) => {
  const fields = getTaskFieldNames(stepIndex);

  return (
    <Stack spacing={3}>
      <StepHeader stepIndex={stepIndex} />

      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
        TASK DETAILS
      </Typography>

      <FormInput
        name={fields.title}
        label="Task Title"
        placeholder="Complete the scavenger hunt challenge"
        required
      />

      <FormTextArea
        name={fields.instructions}
        label="Task Instructions"
        placeholder="Find all 5 hidden markers in this area and note down their colors..."
        rows={4}
        helperText="What the player needs to do to complete this task"
      />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
        AI VALIDATION (OPTIONAL)
      </Typography>

      <FormTextArea
        name={fields.aiInstructions}
        label="AI Instructions"
        placeholder="Verify that the player has found all 5 markers with correct colors..."
        rows={3}
        helperText="Instructions for AI to validate player responses (future feature)"
      />

      <Divider sx={{ my: 2 }} />

      <LocationFields stepIndex={stepIndex} />

      <Divider sx={{ my: 2 }} />

      <HintField stepIndex={stepIndex} />
    </Stack>
  );
};
