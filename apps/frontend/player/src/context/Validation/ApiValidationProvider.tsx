import { useState, useCallback, type ReactNode } from 'react';
import type { AnswerType, AnswerPayload } from '@hunthub/shared';
import { useValidateAnswer } from '@/api';
import { ValidationContext } from './context';

interface ValidationState {
  isCorrect: boolean | null;
  feedback: string | null;
  attemptCount: number;
  isExpired: boolean;
  isExhausted: boolean;
}

const initialState: ValidationState = {
  isCorrect: null,
  feedback: null,
  attemptCount: 0,
  isExpired: false,
  isExhausted: false,
};

interface ApiValidationProviderProps {
  sessionId: string;
  nextStepId: number | null;
  children: ReactNode;
}

/**
 * Provides API-based validation for /play route.
 *
 * IMPORTANT: Use key={stepId} on this component to reset state when step changes. "You might not need an effect"
 * Example: <ApiValidationProvider key={stepId} sessionId={sessionId}> instead of useEffect with stepId dep and setState(initial)
 */
export const ApiValidationProvider = ({ sessionId, nextStepId, children }: ApiValidationProviderProps) => {
  const { validate: validateAnswer, isValidating, reset: resetMutation } = useValidateAnswer();
  const [state, setState] = useState<ValidationState>(initialState);

  const validate = useCallback(
    async (answerType: AnswerType, payload: AnswerPayload) => {
      if (!sessionId) {
        setState((prev) => ({
          ...prev,
          isCorrect: false,
          feedback: 'Session not found. Please restart the hunt.',
          attemptCount: prev.attemptCount + 1,
        }));
        return;
      }

      try {
        const data = await validateAnswer({ sessionId, answerType, payload, nextStepId });
        setState((prev) => ({
          isCorrect: data.correct,
          feedback: data.expired
            ? 'Time expired for this step.'
            : data.exhausted
              ? 'No attempts remaining.'
              : (data.feedback ?? null),
          attemptCount: data.attempts ?? (data.correct ? prev.attemptCount : prev.attemptCount + 1),
          isExpired: data.expired ?? false,
          isExhausted: data.exhausted ?? false,
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          isCorrect: false,
          feedback: 'Something went wrong. Please try again.',
          attemptCount: prev.attemptCount + 1,
        }));
      }
    },
    [sessionId, nextStepId, validateAnswer],
  );

  /**
   * Reset both local state and mutation state to keep them in sync.
   *
   * Example without resetMutation():
   * 1. User submits wrong answer → mutation catches error internally
   * 2. User moves to next step → reset() clears our state
   * 3. But mutation's internal error/isError still holds the old error
   * 4. If we ever expose error from context, it would be stale
   */
  const reset = useCallback(() => {
    setState(initialState);
    resetMutation();
  }, [resetMutation]);

  return (
    <ValidationContext.Provider
      value={{
        validate,
        isValidating,
        isCorrect: state.isCorrect,
        feedback: state.feedback,
        attemptCount: state.attemptCount,
        isExpired: state.isExpired,
        isExhausted: state.isExhausted,
        reset,
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
};
