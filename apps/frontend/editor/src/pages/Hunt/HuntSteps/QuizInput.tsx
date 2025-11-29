import { Divider, Typography } from '@mui/material';
import { useWatch } from 'react-hook-form';
import { ChallengeType, OptionType } from '@hunthub/shared';
import { FormInput, FormTextArea, FormToggleButtonGroup, getFieldPath } from '@/components/form';
import { StepCard } from './components';
import { StepSettings } from './StepSettings';
import { MultipleChoiceEditor } from './components/Quiz';
import { STEP_TYPE_CONFIG } from '@/pages/Hunt/HuntSteps/stepTypeConfig';
import { ListBulletsIcon, TextTIcon } from '@phosphor-icons/react';

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
  { value: OptionType.Choice, label: 'Multiple Choice', icon: <ListBulletsIcon size={16} weight="bold" /> },
  { value: OptionType.Input, label: 'Text Input', icon: <TextTIcon size={16} weight="bold" /> },
];

export const QuizInput = ({ stepIndex }: QuizInputProps) => {
  const fields = getQuizFieldNames(stepIndex);
  const { color } = STEP_TYPE_CONFIG[ChallengeType.Quiz];

  const quizType = useWatch({ name: fields.type });
  const isMultipleChoice = quizType === OptionType.Choice;

  return (
    <StepCard stepIndex={stepIndex} type={ChallengeType.Quiz}>
      <Typography variant="label" color="text.secondary">
        Quiz Content
      </Typography>

      <FormToggleButtonGroup name={fields.type} label="Answer Type" options={QUIZ_TYPE_OPTIONS} color={color} />

      <FormTextArea name={fields.description} label="Question" placeholder="When was this library built?" rows={2} />

      {isMultipleChoice ? (
        <MultipleChoiceEditor stepIndex={stepIndex} />
      ) : (
        <FormInput
          name={fields.targetText}
          label="Correct Answer"
          placeholder="1892"
          helperText="The answer players need to provide"
        />
      )}

      <Divider sx={{ my: 2 }} />

      <StepSettings stepIndex={stepIndex} />
    </StepCard>
  );
};
