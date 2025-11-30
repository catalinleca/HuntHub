import { Box, Divider, Typography } from '@mui/material';
import { useWatch } from 'react-hook-form';
import { ChallengeType, OptionType } from '@hunthub/shared';
import { FormInput, FormTextArea, FormToggleButtonGroup, getFieldPath } from '@/components/form';
import { WithTransition } from '@/components/common';
import { StepCard } from './components';
import { StepSettings } from './StepSettings';
import { MultipleChoiceEditor, AnswerSection } from './components/Quiz';
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
  options: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.options),
  targetId: getFieldPath((h) => h.hunt.steps[stepIndex].challenge.quiz.targetId),
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

  const text = isMultipleChoice ? 'Answer Options (click ✓ to mark correct)' : 'Expected Answer';

  return (
    <StepCard stepIndex={stepIndex} type={ChallengeType.Quiz}>
      <Typography variant="label" color="text.secondary">
        Quiz Content
      </Typography>

      <FormToggleButtonGroup name={fields.type} label="Answer Type" options={QUIZ_TYPE_OPTIONS} color={color} />

      <FormInput name={fields.title} label="Question" placeholder="When was this library built?" />

      <FormTextArea name={fields.description} label="Details" placeholder="Markdown placeholder" rows={2} />

      <AnswerSection>
        <WithTransition transitionKey={quizType} variant="fade-slide-down">
          <>
            <Box mb={3}>
              <Typography variant="smBold" color="success.main">
                {text}
              </Typography>
            </Box>

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
          </>
        </WithTransition>
      </AnswerSection>

      <Divider sx={{ my: 2 }} />

      <StepSettings stepIndex={stepIndex} />
    </StepCard>
  );
};
