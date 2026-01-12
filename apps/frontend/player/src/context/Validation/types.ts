import type { AnswerType, AnswerPayload } from '@hunthub/shared';

/**
 * Result from validation (mock or API)
 */
export interface ValidationResult {
  isCorrect: boolean;
  feedback: string;
}

/**
 * Validation context value - same interface for both API and Mock providers
 */
export interface ValidationContextValue {
  /** Validate an answer */
  validate: (answerType: AnswerType, payload: AnswerPayload) => void;
  /** Whether validation is in progress */
  isValidating: boolean;
  /** Whether the last answer was correct (null if not yet validated) */
  isCorrect: boolean | null;
  /** Feedback message from validation */
  feedback: string | null;
  /** Reset validation state (e.g., when step changes) */
  reset: () => void;
}
