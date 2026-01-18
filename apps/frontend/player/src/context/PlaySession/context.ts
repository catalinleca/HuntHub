import { createContext } from 'react';
import type { StepPF, HuntMetaPF } from '@hunthub/shared';

export interface SessionState {
  isLoading: boolean;
  error: Error | null;
}

export interface SessionData {
  sessionId: string | null;
  huntMeta: HuntMetaPF | null;
  currentStep: StepPF | null;
  currentStepIndex: number;
  totalSteps: number;
  previewHint?: string;
  isPreview: boolean;
  stepOrder: number[];
}

export interface SessionActions {
  startSession: (playerName: string, email?: string) => void;
  abandonSession: () => void;
  goToStep: (stepIndex: number) => void;
}

export interface SessionDerived {
  hasSession: boolean;
  isLastStep: boolean;
  isComplete: boolean;
  nextStepId: number | null;
}

export type PlaySessionContextValue = SessionState & SessionData & SessionActions & SessionDerived;

export const PlaySessionContext = createContext<PlaySessionContextValue | null>(null);
