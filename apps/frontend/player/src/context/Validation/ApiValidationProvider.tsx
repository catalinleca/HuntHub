import { useCallback, useRef, type ReactNode } from 'react';
import type { AnswerType, AnswerPayload, ValidateAnswerResponse } from '@hunthub/shared';
import { useValidateAnswer } from '@/api';
import { useSessionId } from '@/context';
import { ValidationContext } from './ValidationContext';
import { SuccessDialog } from './SuccessDialog';

interface ApiValidationProviderProps {
  onAdvance: () => void;
  showSuccessDialog?: boolean;
  children: ReactNode;
}

const getFeedback = (data: ValidateAnswerResponse | undefined): string | null => {
  if (!data) {
    return null;
  }

  if (data.expired) {
    return 'Time expired for this step.';
  }

  if (data.exhausted) {
    return 'No attempts remaining.';
  }

  return data.feedback ?? null;
};

export const ApiValidationProvider = ({
  onAdvance,
  showSuccessDialog = false,
  children,
}: ApiValidationProviderProps) => {
  const sessionId = useSessionId();
  const { validate: validateAnswer, isValidating, data, error, reset } = useValidateAnswer();
  const lastFeedbackRef = useRef<string | null>(null);

  const validate = useCallback(
    async (answerType: AnswerType, payload: AnswerPayload) => {
      if (!sessionId) {
        return;
      }

      await validateAnswer({ sessionId, answerType, payload });
    },
    [sessionId, validateAnswer],
  );

  const handleDialogContinue = useCallback(() => {
    onAdvance();
  }, [onAdvance]);

  const isCorrect = error ? false : (data?.correct ?? null);
  const attemptCount = data?.attempts ?? 0;
  const isExpired = data?.expired ?? false;
  const isExhausted = data?.exhausted ?? false;

  const dialogOpen = showSuccessDialog && isCorrect === true;
  const dialogFeedback = getFeedback(data);
  const currentFeedback = error ? 'Something went wrong. Please try again.' : dialogOpen ? null : dialogFeedback;

  if (!isValidating && currentFeedback !== null) {
    lastFeedbackRef.current = currentFeedback;
  }
  const feedback = isValidating ? lastFeedbackRef.current : currentFeedback;

  return (
    <ValidationContext.Provider
      value={{
        validate,
        isValidating,
        isCorrect,
        feedback,
        attemptCount,
        isExpired,
        isExhausted,
        reset,
      }}
    >
      {children}
      <SuccessDialog
        open={dialogOpen}
        feedback={dialogFeedback}
        isHuntComplete={data?.isComplete ?? false}
        onContinue={handleDialogContinue}
      />
    </ValidationContext.Provider>
  );
};
