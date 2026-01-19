import type { StepPF, HuntMetaPF } from '@hunthub/shared';

export type SessionStatus = 'loading' | 'error' | 'identifying' | 'playing' | 'completed';

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
}

export interface SessionActions {
  startSession: (playerName: string, email?: string) => void;
  abandonSession: () => void;
  advanceToNextStep: () => void;
}
