import { createContext, useContext } from 'react';
import type { AnswerType, AnswerPayload } from '@hunthub/shared';

export interface ValidationResult {
  isCorrect: boolean;
  feedback: string;
}

export interface ValidationContextValue {
  validate: (answerType: AnswerType, payload: AnswerPayload) => Promise<void> | void;
  isValidating: boolean;
  isCorrect: boolean | null;
  feedback: string | null;
  attemptCount: number;
  isExpired: boolean;
  isExhausted: boolean;
  reset: () => void;
}

export const ValidationContext = createContext<ValidationContextValue | null>(null);

export const useValidation = (): ValidationContextValue => {
  const context = useContext(ValidationContext);

  if (!context) {
    throw new Error('useValidation must be used within a ValidationProvider');
  }

  return context;
};
