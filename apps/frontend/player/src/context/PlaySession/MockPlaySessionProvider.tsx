import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { PlaySessionContext, type PlaySessionContextValue } from './context';

interface MockPlaySessionProviderProps {
  children: ReactNode;
  /** Optional mock session ID. Defaults to 'mock-session' */
  sessionId?: string;
}

/**
 * Mock provider for preview/embedded modes.
 * Provides a fake session context so components using usePlaySession() work without a real session.
 */
export const MockPlaySessionProvider = ({ children, sessionId = 'mock-session' }: MockPlaySessionProviderProps) => {
  const value = useMemo<PlaySessionContextValue>(
    () => ({
      // Session state
      isLoading: false,
      error: null,

      // Session data
      sessionId,
      huntMeta: null,
      currentStep: null,
      currentStepIndex: 0,
      totalSteps: 0,

      // Session actions (no-op in mock)
      startSession: () => {},

      // Derived state
      hasSession: true,
      isLastStep: false,
      isComplete: false,
      nextStepId: null,
    }),
    [sessionId],
  );

  return <PlaySessionContext.Provider value={value}>{children}</PlaySessionContext.Provider>;
};
