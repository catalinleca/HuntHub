import { createContext } from 'react';
import type { StepPF, HuntMetaPF } from '@hunthub/shared';

export const SessionStatus = {
  Loading: 'loading',
  Error: 'error',
  Identifying: 'identifying',
  Playing: 'playing',
  Completed: 'completed',
} as const;

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export interface StepPlayProgress {
  attempts: number;
  hintsUsed: number;
  startedAt: string | null;
}

export interface SessionState {
  status: SessionStatus;
  error: Error | null;
  sessionId: string | null;
  huntMeta: HuntMetaPF | null;
  currentStep: StepPF | null;
  currentStepIndex: number;
  totalSteps: number;
  isLastStep: boolean;
  previewHint?: string;
  stepPlayProgress: StepPlayProgress | null;
}

export interface SessionActions {
  startSession: (playerName: string, email?: string) => void;
  abandonSession: () => void;
  advanceToNextStep: () => void;
}

export const SessionStateContext = createContext<SessionState | null>(null);
export const SessionActionsContext = createContext<SessionActions | null>(null);
