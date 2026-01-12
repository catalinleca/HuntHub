import { useState, useCallback, useEffect, type ReactNode } from 'react';
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
  /** Session ID for API validation */
  sessionId: string;
  /** Current step ID - resets state when step changes */
  stepId: number;
  children: ReactNode;
}

/**
 * Provides API-based validation for /play route
 * Wraps useValidateAnswer mutation with context interface
 */
export const ApiValidationProvider = ({ sessionId, stepId, children }: ApiValidationProviderProps) => {
  const validateMutation = useValidateAnswer();
  const [state, setState] = useState<ValidationState>(initialState);

  // Reset state when step changes
  useEffect(() => {
    setState(initialState);
  }, [stepId]);

  const validate = useCallback(
    (answerType: AnswerType, payload: AnswerPayload) => {
      if (!sessionId) {
        console.warn('validate called without sessionId');
        return;
      }

      validateMutation.mutate(
        { sessionId, answerType, payload },
        {
          onSuccess: (data) => {
            setState({
              isCorrect: data.correct,
              feedback: data.feedback ?? null,
            });
          },
          onError: () => {
            setState({
              isCorrect: false,
              feedback: 'Something went wrong. Please try again.',
            });
          },
        },
      );
    },
    [sessionId, validateMutation],
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <ValidationContext.Provider
      value={{
        validate,
        isValidating: validateMutation.isPending,
        isCorrect: state.isCorrect,
        feedback: state.feedback,
        reset,
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
};
