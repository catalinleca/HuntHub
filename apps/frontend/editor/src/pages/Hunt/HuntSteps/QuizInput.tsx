import { Divider, Typography } from '@mui/material';
import { ChallengeType, OptionType } from '@hunthub/shared';
import { FormInput, FormTextArea, FormSelect, getFieldPath } from '@/components/form';
import { StepCard } from './components';
import { StepSettings } from './StepSettings';

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
    <StepCard stepIndex={stepIndex} type={ChallengeType.Quiz}>
      <Typography variant="label" color="text.secondary">
        Quiz Content
      </Typography>

      <FormSelect name={fields.type} label="Answer Type" options={QUIZ_TYPE_OPTIONS} placeholder="Select answer type" />

      <FormTextArea name={fields.description} label="Question" placeholder="When was this library built?" rows={3} />

      <FormInput
        name={fields.targetText}
        label="Correct Answer"
        placeholder="1892"
        helperText="The answer players need to provide"
      />

      <Divider sx={{ my: 2 }} />

      <StepSettings stepIndex={stepIndex} />
    </StepCard>
  );
};
