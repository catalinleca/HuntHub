export const stepKeys = {
  all: () => ['steps'] as const,
  lists: () => [...stepKeys.all(), 'list'] as const,
  byHunt: (huntId: number) => [...stepKeys.lists(), { huntId }] as const,
  details: () => [...stepKeys.all(), 'detail'] as const,
  detail: (stepId: number) => [...stepKeys.details(), stepId] as const,
};
