import { Typography } from '@mui/material';
import type { StepPF } from '@hunthub/shared';
import { useValidation } from '@/context';
import { ClueChallenge, QuizChallenge, MissionChallenge, TaskChallenge } from '@/components/challenges';

interface StepRendererProps {
  step: StepPF;
  isLastStep: boolean;
}

export const StepRenderer = ({ step, isLastStep }: StepRendererProps) => {
  const { validate, isValidating, feedback } = useValidation();

  switch (step.type) {
    case 'clue': {
      if (!step.challenge.clue) {
        return <Typography color="error">Invalid clue data</Typography>;
      }
      return (
        <ClueChallenge
          clue={step.challenge.clue}
          onValidate={validate}
          isValidating={isValidating}
          isLastStep={isLastStep}
          feedback={feedback}
        />
      );
    }

    case 'quiz': {
      if (!step.challenge.quiz) {
        return <Typography color="error">Invalid quiz data</Typography>;
      }
      return (
        <QuizChallenge
          quiz={step.challenge.quiz}
          onValidate={validate}
          isValidating={isValidating}
          isLastStep={isLastStep}
          feedback={feedback}
        />
      );
    }

    case 'mission': {
      if (!step.challenge.mission) {
        return <Typography color="error">Invalid mission data</Typography>;
      }
      return (
        <MissionChallenge
          mission={step.challenge.mission}
          onValidate={validate}
          isValidating={isValidating}
          isLastStep={isLastStep}
          feedback={feedback}
        />
      );
    }

    case 'task': {
      if (!step.challenge.task) {
        return <Typography color="error">Invalid task data</Typography>;
      }
      return <TaskChallenge task={step.challenge.task} />;
    }

    default:
      return <Typography color="error">Unknown challenge type: {step.type}</Typography>;
  }
};
