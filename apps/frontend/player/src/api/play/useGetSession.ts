import { useQuery } from '@tanstack/react-query';
import { playKeys } from './keys';
import { mockGetSession } from './mockData';
import { queryFnOrSkip } from '@/utils';

const SKIP_KEY = '__skip__';

export const useGetSession = (sessionId: string | null) => {
  return useQuery({
    queryKey: playKeys.session(sessionId ?? SKIP_KEY),
    queryFn: queryFnOrSkip(mockGetSession, sessionId),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
