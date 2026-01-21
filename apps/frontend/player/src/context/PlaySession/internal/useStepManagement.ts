import { useStep, usePrefetchStep } from '@/api';

const extractStepIdFromLink = (link?: { href: string } | null): number | null => {
  if (!link) {
    return null;
  }

  const match = link.href.match(/\/step\/(\d+)$/);

  return match ? parseInt(match[1], 10) : null;
};

export const useStepManagement = (sessionId: string | null, currentStepId: number | null) => {
  const stepQuery = useStep(sessionId, currentStepId);
  const nextStepId = extractStepIdFromLink(stepQuery.data?._links?.next);

  usePrefetchStep(sessionId, nextStepId);

  return { stepQuery, nextStepId };
};
