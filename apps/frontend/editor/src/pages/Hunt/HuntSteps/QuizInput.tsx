import { Stack, Divider, Typography } from '@mui/material';
import { FormInput, FormTextArea, FormSelect, getFieldPath } from '@/components/form';
import { OptionType } from '@hunthub/shared';
import { StepHeader, LocationFields, HintField } from './components';

interface QuizInputProps {
  stepIndex: number;
}

const getQuizFieldNames = (stepIndex: number) => ({
  title: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.title),
  description: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.description),
  type: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.type),
  targetText: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.target.text),
});

const QUIZ_TYPE_OPTIONS = [
  { value: OptionType.Choice, label: 'Multiple Choice' },
  { value: OptionType.Input, label: 'Text Input' },
];

export const QuizInput = ({ stepIndex }: QuizInputProps) => {
  const fields = getQuizFieldNames(stepIndex);

  return (
    <Stack spacing={3}>
      <StepHeader stepIndex={stepIndex} />

      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
        QUESTION DETAILS
      </Typography>

      <FormInput
        name={fields.title}
        label="Question Title"
        placeholder="What year was this building constructed?"
        required
      />

      <FormTextArea
        name={fields.description}
        label="Question Description"
        placeholder="Look at the cornerstone near the entrance..."
        rows={3}
      />

      <FormSelect name={fields.type} label="Answer Type" options={QUIZ_TYPE_OPTIONS} placeholder="Select answer type" />

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
        CORRECT ANSWER
      </Typography>

      <FormInput
        name={fields.targetText}
        label="Correct Answer"
        placeholder="1892"
        required
        helperText="The answer players need to provide"
      />

      <Divider sx={{ my: 2 }} />

      <LocationFields stepIndex={stepIndex} />

      <Divider sx={{ my: 2 }} />

      <HintField stepIndex={stepIndex} />
    </Stack>
  );
};
