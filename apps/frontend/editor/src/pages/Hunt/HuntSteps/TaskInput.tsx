import { Divider, Typography } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import { FormInput, FormTextArea, FormMediaInput, getFieldPath } from '@/components/form';
import { StepCard } from './components';
import { StepSettings } from './StepSettings';

interface TaskInputProps {
  stepIndex: number;
}

const getTaskFieldNames = (stepIndex: number) => ({
  title: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.task.title),
  instructions: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.task.instructions),
  aiInstructions: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.task.aiInstructions),
  media: getFieldPath((h) => h.hunt.steps[stepIndex].media),
});

export const TaskInput = ({ stepIndex }: TaskInputProps) => {
  const fields = getTaskFieldNames(stepIndex);

  return (
    <StepCard stepIndex={stepIndex} type={ChallengeType.Task}>
      <Typography variant="label" color="text.secondary">
        Task Content
      </Typography>

      <FormInput name={fields.title} label="Title" placeholder="Casa Batlló Architecture" />

      <FormTextArea
        name={fields.instructions}
        label="Player Instructions"
        placeholder="Describe the unique architectural features you observe..."
        rows={4}
      />

      <FormTextArea
        name={fields.aiInstructions}
        label="AI Validation"
        placeholder="Tell the AI how to validate responses..."
        rows={3}
        helperText="Example: 'Accept if player mentions at least 2 architectural features'"
      />

      <Divider sx={{ my: 2 }} />

      <FormMediaInput name={fields.media} label="Media" description="Optional image, audio, or video for this task" />

      <Divider sx={{ my: 2 }} />

      <StepSettings stepIndex={stepIndex} />
    </StepCard>
  );
};
