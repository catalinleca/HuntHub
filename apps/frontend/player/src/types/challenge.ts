import type { AnswerType, AnswerPayload, Media } from '@hunthub/shared';

export interface BaseChallengeProps {
  onValidate: (answerType: AnswerType, payload: AnswerPayload) => Promise<void> | void;
  isValidating: boolean;
  isLastStep: boolean;
  feedback: string | null;
  currentAttempts: number;
  media?: Media | null;
  timeLimit?: number | null;
  maxAttempts?: number | null;
  hasHint: boolean;
}

export type ChallengeProps<T> = BaseChallengeProps & { challenge: T };
