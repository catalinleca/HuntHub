import { useState, useCallback, type ReactNode } from 'react';
import type { AnswerType, AnswerPayload } from '@hunthub/shared';
import { useValidateAnswer } from '@/api';
import { ValidationContext } from './context';

interface ValidationState {
  isCorrect: boolean | null;
  feedback: string | null;
}

const initialState: ValidationState = {
  isCorrect: null,
  feedback: null,
};

interface ApiValidationProviderProps {
  sessionId: string;
  children: ReactNode;
}

/**
 * Provides API-based validation for /play route.
 *
 * IMPORTANT: Use key={stepId} on this component to reset state when step changes. "You might not need an effect"
 * Example: <ApiValidationProvider key={stepId} sessionId={sessionId}> instead of useEffect with stepId dep and setState(initial)
 */
export const ApiValidationProvider = ({ sessionId, children }: ApiValidationProviderProps) => {
  const { validate: validateAnswer, isValidating, reset: resetMutation } = useValidateAnswer();
  const [state, setState] = useState<ValidationState>(initialState);

  const validate = useCallback(
    async (answerType: AnswerType, payload: AnswerPayload) => {
      if (!sessionId) {
        setState({
          isCorrect: false,
          feedback: 'Session not found. Please restart the hunt.',
        });
        return;
      }

      try {
        const data = await validateAnswer({ sessionId, answerType, payload });
        setState({
          isCorrect: data.correct,
          feedback: data.feedback ?? null,
        });
      } catch {
        setState({
          isCorrect: false,
          feedback: 'Something went wrong. Please try again.',
        });
      }
    },
    [sessionId, validateAnswer],
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
        reset,
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
};
