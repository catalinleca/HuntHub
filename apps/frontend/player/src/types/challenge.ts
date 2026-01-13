import type { AnswerType, AnswerPayload, Media } from '@hunthub/shared';

export interface BaseChallengeProps {
  onValidate: (answerType: AnswerType, payload: AnswerPayload) => void;
  isValidating: boolean;
  isLastStep: boolean;
  feedback: string | null;
  media?: Media;
  timeLimit?: number | null;
  maxAttempts?: number | null;
}

export type ChallengeProps<T> = BaseChallengeProps & { challenge: T };
