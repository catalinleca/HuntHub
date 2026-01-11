export const playKeys = {
  all: ['play'] as const,
  session: (huntId: number) => [...playKeys.all, 'session', huntId] as const,
  currentStep: (sessionId: string) => [...playKeys.all, 'step', sessionId, 'current'] as const,
  nextStep: (sessionId: string) => [...playKeys.all, 'step', sessionId, 'next'] as const,
};
