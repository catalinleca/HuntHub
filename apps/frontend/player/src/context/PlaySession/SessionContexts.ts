import { createContext } from 'react';
import type { StepResponse, HuntMetaPF } from '@hunthub/shared';

export const SessionStatus = {
  Loading: 'loading',
  Error: 'error',
  Identifying: 'identifying',
  Playing: 'playing',
  Completed: 'completed',
} as const;

export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export interface SessionState {
  status: SessionStatus;
  error: Error | null;
  sessionId: string | null;
  huntMeta: HuntMetaPF | null;
  stepResponse: StepResponse | null;
  isLastStep: boolean;
  startedAt: string | null;
  completedAt: string | null;
  previewHint?: string;
  isPreview?: boolean;
  stepOrder?: number[];
}

export interface SessionActions {
  startSession: (playerName: string, email?: string) => void;
  abandonSession: () => void;
  advanceToNextStep: () => void;
  navigateToStep?: (stepId: number) => Promise<void>;
  navigateNext?: () => Promise<void>;
  navigatePrev?: () => Promise<void>;
}

export const SessionStateContext = createContext<SessionState | null>(null);
export const SessionActionsContext = createContext<SessionActions | null>(null);
