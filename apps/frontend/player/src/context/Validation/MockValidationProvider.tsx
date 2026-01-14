import { useState, useCallback, type ReactNode } from 'react';
import type { StepPF, AnswerType, AnswerPayload } from '@hunthub/shared';
import { ValidationContext } from './context';
import type { ValidationResult } from './types';

interface ValidationState {
  isCorrect: boolean | null;
  feedback: string | null;
  attemptCount: number;
}

const initialState: ValidationState = {
  isCorrect: null,
  feedback: null,
  attemptCount: 0,
};

/**
 * Simulated validation for preview mode.
 * Since preview data is sanitized (no answers), we simulate validation.
 * All submissions are marked as correct after a brief delay feeling.
 */
const simulateValidation = (answerType: AnswerType): ValidationResult => {
  switch (answerType) {
    case 'clue':
      return { isCorrect: true, feedback: 'Got it! Moving on...' };
    case 'quiz-choice':
    case 'quiz-input':
      return { isCorrect: true, feedback: 'Correct! (Preview mode - always valid)' };
    case 'mission-location':
      return { isCorrect: true, feedback: 'Location found! (Preview mode)' };
    case 'mission-media':
      return { isCorrect: true, feedback: 'Media received! (Preview mode)' };
    case 'task':
      return { isCorrect: true, feedback: 'Task completed! (Preview mode)' };
    default:
      return { isCorrect: true, feedback: 'Validated (Preview mode)' };
  }
};

interface MockValidationProviderProps {
  /** Sanitized step (StepPF) - no answers available in preview mode */
  step: StepPF;
  /** Callback when validation completes (for postMessage to Editor, or auto-advance) */
  onValidated?: (result: ValidationResult) => void;
  children: ReactNode;
}

/**
 * Provides simulated validation for /preview route.
 * Since preview data is sanitized (no answers), all validations succeed.
 *
 * IMPORTANT: Use key={stepId} on this component to reset state when step changes.
 * Example: <MockValidationProvider key={stepId} step={step}>
 */
export const MockValidationProvider = ({ step, onValidated, children }: MockValidationProviderProps) => {
  const [state, setState] = useState<ValidationState>(initialState);

  const validate = useCallback(
    (answerType: AnswerType, _payload: AnswerPayload) => {
      const result = simulateValidation(answerType);

      setState((prev) => ({
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        attemptCount: prev.attemptCount + 1,
      }));

      onValidated?.(result);
    },
    [onValidated],
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
        attemptCount: state.attemptCount,
        reset,
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
};
