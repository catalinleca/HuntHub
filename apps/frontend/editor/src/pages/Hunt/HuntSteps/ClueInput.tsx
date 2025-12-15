import { Divider, Typography } from '@mui/material';
import { ChallengeType } from '@hunthub/shared';
import { FormInput, FormTextArea, FormMediaInput, getFieldPath } from '@/components/form';
import { StepCard } from './components';
import { StepSettings } from './StepSettings';

interface ClueInputProps {
  stepIndex: number;
}

const getClueFieldNames = (stepIndex: number) => ({
  title: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.clue.title),
  description: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.clue.description),
  media: getFieldPath((h) => h.hunt.steps[stepIndex].media),
});

export const ClueInput = ({ stepIndex }: ClueInputProps) => {
  const fields = getClueFieldNames(stepIndex);

  return (
    <StepCard stepIndex={stepIndex} type={ChallengeType.Clue}>
      <Typography variant="label" color="text.secondary">
        Clue Content
      </Typography>

      <FormInput name={fields.title} label="Title" placeholder="Welcome to Downtown" />

      <FormTextArea
        name={fields.description}
        label="Description"
        placeholder="Start your journey at the historic fountain in the town square..."
        rows={4}
      />

      <Divider sx={{ my: 2 }} />

      <FormMediaInput name={fields.media} label="Media" description="Optional image, audio, or video for this clue" />

      <Divider sx={{ my: 2 }} />

      <StepSettings stepIndex={stepIndex} />
    </StepCard>
  );
};
