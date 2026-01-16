import { useCallback, type ReactNode } from 'react';
import type { AnswerType, AnswerPayload, ValidateAnswerResponse } from '@hunthub/shared';
import { useValidateAnswer } from '@/api';
import { ValidationContext } from './context';
import { SuccessDialog } from './SuccessDialog';

interface ApiValidationProviderProps {
  sessionId: string;
  nextStepId: number | null;
  showSuccessDialog?: boolean;
  children: ReactNode;
}

function getFeedback(data: ValidateAnswerResponse | undefined): string | null {
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
}

/**
 * Provides API-based validation for /play route.
 *
 * IMPORTANT: Use key={stepId} on this component to reset state when step changes.
 */
export const ApiValidationProvider = ({
  sessionId,
  nextStepId,
  showSuccessDialog = false,
  children,
}: ApiValidationProviderProps) => {
  const { validate: validateAnswer, isValidating, data, reset, advanceToNextStep } = useValidateAnswer();

  const handleValidationSuccess = useCallback(
    (responseData: ValidateAnswerResponse) => {
      if (showSuccessDialog) {
        return;
      }
      advanceToNextStep(sessionId, nextStepId, responseData.isComplete ?? false);
    },
    [showSuccessDialog, advanceToNextStep, sessionId, nextStepId],
  );

  const validate = useCallback(
    async (answerType: AnswerType, payload: AnswerPayload) => {
      const responseData = await validateAnswer({ sessionId, answerType, payload, nextStepId });

      if (responseData.correct) {
        handleValidationSuccess(responseData);
      }
    },
    [sessionId, nextStepId, validateAnswer, handleValidationSuccess],
  );

  const handleDialogContinue = useCallback(() => {
    advanceToNextStep(sessionId, nextStepId, data?.isComplete ?? false);
  }, [advanceToNextStep, sessionId, nextStepId, data?.isComplete]);

  const isCorrect = data?.correct ?? null;
  const feedback = getFeedback(data);
  const attemptCount = data?.attempts ?? 0;
  const isExpired = data?.expired ?? false;
  const isExhausted = data?.exhausted ?? false;

  const dialogOpen = showSuccessDialog && isCorrect === true;

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
        feedback={feedback}
        isHuntComplete={data?.isComplete ?? false}
        onContinue={handleDialogContinue}
      />
    </ValidationContext.Provider>
  );
};
