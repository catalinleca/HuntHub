import { useState, useCallback, type ReactNode } from 'react';
import type { Step, AnswerType, AnswerPayload } from '@hunthub/shared';
import { checkAnswer } from '@/utils/checkAnswer';
import { ValidationContext } from './context';
import type { ValidationResult } from './types';

interface ValidationState {
  isCorrect: boolean | null;
  feedback: string | null;
}

const initialState: ValidationState = {
  isCorrect: null,
  feedback: null,
};

interface MockValidationProviderProps {
  /** Full Step with answers (for client-side validation) */
  step: Step;
  /** Callback when validation completes (for postMessage to Editor, or auto-advance) */
  onValidated?: (result: ValidationResult) => void;
  children: ReactNode;
}

/**
 * Provides client-side validation for /preview route.
 * Validation is instant (no API call).
 *
 * IMPORTANT: Use key={stepId} on this component to reset state when step changes.
 * Example: <MockValidationProvider key={stepId} step={step}>
 */
export const MockValidationProvider = ({ step, onValidated, children }: MockValidationProviderProps) => {
  const [state, setState] = useState<ValidationState>(initialState);

  const validate = useCallback(
    (answerType: AnswerType, payload: AnswerPayload) => {
      try {
        const result = checkAnswer(step, answerType, payload);

        setState({
          isCorrect: result.isCorrect,
          feedback: result.feedback,
        });

        onValidated?.(result);
      } catch {
        setState({
          isCorrect: false,
          feedback: 'Something went wrong. Please try again.',
        });
      }
    },
    [step, onValidated],
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <ValidationContext.Provider
      value={{
        validate,
        isValidating: false, // Always false - validation is instant
        isCorrect: state.isCorrect,
        feedback: state.feedback,
        reset,
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
};
