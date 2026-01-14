import { useQuery, skipToken } from '@tanstack/react-query';
import { playKeys, SKIP_KEY } from './keys';
import { getSession } from './api';

export const useGetSession = (sessionId: string | null) => {
  return useQuery({
    queryKey: playKeys.session(sessionId ?? SKIP_KEY),
    queryFn: sessionId ? () => getSession(sessionId) : skipToken,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};
