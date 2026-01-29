import { useStep, usePrefetchStep } from '@/api';
import { usePrefetchMedia } from './usePrefetchMedia';

const extractStepIdFromLink = (link?: { href: string } | null): number | null => {
  if (!link) {
    return null;
  }

  const match = link.href.match(/\/step\/(\d+)$/);

  return match ? parseInt(match[1], 10) : null;
};

export const useStepManagement = (sessionId: string | null, currentStepId: number | null) => {
  const currentStepQuery = useStep(sessionId, currentStepId);
  const nextStepId = extractStepIdFromLink(currentStepQuery.data?._links?.next);

  const nextStepQuery = usePrefetchStep(sessionId, nextStepId);
  usePrefetchMedia(nextStepQuery.data?.step.media ?? null);

  return { stepQuery: currentStepQuery, nextStepId };
};
