import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { StartSessionResponse } from '@hunthub/shared';
import { playKeys } from './keys';
import { mockGetSession } from './mockData';

// TODO: Replace with real API call when backend is ready
const getSession = async (sessionId: string): Promise<StartSessionResponse | null> => {
  return mockGetSession(sessionId);
};

export const useGetSession = (huntId: number, sessionId: string | null) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: playKeys.session(huntId),
    queryFn: async () => {
      if (!sessionId) return null;

      const session = await getSession(sessionId);

      if (session) {
        session.steps.forEach((step, index) => {
          const stepIndex = session.currentStepIndex + index;
          queryClient.setQueryData(playKeys.step(huntId, stepIndex), step);
        });
      }

      return session;
    },
    enabled: !!sessionId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
