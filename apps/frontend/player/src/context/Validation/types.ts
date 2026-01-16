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
