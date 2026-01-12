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
  const { validate: validateAnswer, isValidating } = useValidateAnswer();
  const [state, setState] = useState<ValidationState>(initialState);

  const validate = useCallback(
    async (answerType: AnswerType, payload: AnswerPayload) => {
      if (!sessionId) {
        console.warn('validate called without sessionId');
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

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

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
