import { createContext } from 'react';
import type { StepPF, HuntMetaPF, StepLinks } from '@hunthub/shared';

export interface SessionState {
  isLoading: boolean;
  error: Error | null;
}

export interface SessionData {
  sessionId: string | null;
  huntMeta: HuntMetaPF | null;
  currentStep: StepPF | null;
  stepLinks: StepLinks | null;
  currentStepIndex: number;
  totalSteps: number;
}

export interface SessionActions {
  startSession: (playerName: string, email?: string) => void;
}

export interface SessionDerived {
  hasSession: boolean;
  isLastStep: boolean;
  isComplete: boolean;
}

export type PlaySessionContextValue = SessionState & SessionData & SessionActions & SessionDerived;

export const PlaySessionContext = createContext<PlaySessionContextValue | null>(null);
