export const playKeys = {
  all: ['play'] as const,
  session: (huntId: number) => [...playKeys.all, 'session', huntId] as const,
  step: (huntId: number, stepIndex: number) => [...playKeys.all, 'step', huntId, stepIndex] as const,
};
