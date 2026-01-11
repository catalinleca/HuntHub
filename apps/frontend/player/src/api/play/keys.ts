export const playKeys = {
  all: ['play'] as const,
  session: (sessionId: string) => [...playKeys.all, 'session', sessionId] as const,
  currentStep: (sessionId: string) => [...playKeys.all, 'step', sessionId, 'current'] as const,
  nextStep: (sessionId: string) => [...playKeys.all, 'step', sessionId, 'next'] as const,
};
