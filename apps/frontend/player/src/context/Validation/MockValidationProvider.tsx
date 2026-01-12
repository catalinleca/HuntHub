import { useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Step, AnswerType, AnswerPayload } from '@hunthub/shared';
import { checkAnswer } from '@/utils/checkAnswer';
import { ValidationContext } from './context';
import type { ValidationResult } from './types';

interface ValidationState {
  isCorrect: boolean | null;
  feedback: string | null;
  isValidating: boolean;
}

const initialState: ValidationState = {
  isCorrect: null,
  feedback: null,
  isValidating: false,
};

interface MockValidationProviderProps {
  /** Full Step with answers (for client-side validation) */
  step: Step;
  /** Callback when validation completes (for postMessage to Editor, or auto-advance) */
  onValidated?: (result: ValidationResult) => void;
  children: ReactNode;
}

/**
 * Provides client-side mock validation for /preview route
 * Uses checkAnswer utility to validate against full Step data
 */
export const MockValidationProvider = ({ step, onValidated, children }: MockValidationProviderProps) => {
  const [state, setState] = useState<ValidationState>(initialState);

  // Reset state when step changes
  useEffect(() => {
    setState(initialState);
  }, [step.stepId]);

  const validate = useCallback(
    (answerType: AnswerType, payload: AnswerPayload) => {
      // Simulate async validation (brief delay for UX feedback)
      setState((s) => ({ ...s, isValidating: true }));

      // Small delay to show loading state
      setTimeout(() => {
        const result = checkAnswer(step, answerType, payload);

        setState({
          isValidating: false,
          isCorrect: result.isCorrect,
          feedback: result.feedback,
        });

        // Notify parent (for postMessage or auto-advance)
        onValidated?.(result);
      }, 300);
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
        isValidating: state.isValidating,
        isCorrect: state.isCorrect,
        feedback: state.feedback,
        reset,
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
};
