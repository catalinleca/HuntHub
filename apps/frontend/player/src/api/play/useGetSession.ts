import { useQuery } from '@tanstack/react-query';
import type { StartSessionResponse } from '@hunthub/shared';
import { playKeys } from './keys';
import { mockGetSession } from './mockData';

// TODO: Replace with real API call when backend is ready
const getSession = async (sessionId: string): Promise<StartSessionResponse | null> => {
  return mockGetSession(sessionId);
};

export const useGetSession = (huntId: number, sessionId: string | null) => {
  return useQuery({
    queryKey: playKeys.session(huntId),
    queryFn: () => (sessionId ? getSession(sessionId) : Promise.resolve(null)),
    enabled: !!sessionId,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
