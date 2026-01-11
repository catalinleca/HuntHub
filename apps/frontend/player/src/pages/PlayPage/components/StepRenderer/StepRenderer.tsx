import { Typography } from '@mui/material';
import type { StepPF } from '@hunthub/shared';
import { useStepValidation } from '@/hooks';
import { ClueChallenge } from '@/components/challenges/ClueChallenge';
import { QuizChallenge } from '@/components/challenges/QuizChallenge';

interface StepRendererProps {
  step: StepPF;
  isLastStep: boolean;
}

export const StepRenderer = ({ step, isLastStep }: StepRendererProps) => {
  const { validate, isValidating, feedback } = useStepValidation(step.stepId);

  switch (step.type) {
    case 'clue':
      return (
        <ClueChallenge
          clue={step.challenge.clue!}
          onValidate={validate}
          isValidating={isValidating}
          isLastStep={isLastStep}
          feedback={feedback}
        />
      );

    case 'quiz':
      return (
        <QuizChallenge
          quiz={step.challenge.quiz!}
          onValidate={validate}
          isValidating={isValidating}
          isLastStep={isLastStep}
          feedback={feedback}
        />
      );

    case 'mission':
      return <Typography color="text.secondary">Mission challenge coming soon...</Typography>;

    case 'task':
      return <Typography color="text.secondary">Task challenge coming soon...</Typography>;

    default:
      return <Typography color="error">Unknown challenge type: {step.type}</Typography>;
  }
};
