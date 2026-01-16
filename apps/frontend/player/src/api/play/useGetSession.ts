import { useQuery, skipToken } from '@tanstack/react-query';
import type { SessionResponse } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';
import { playKeys, SKIP_KEY } from './keys';

const fetchSession = async (sessionId: string): Promise<SessionResponse> => {
  const { data } = await httpClient.get<SessionResponse>(`/play/sessions/${sessionId}`);
  return data;
};

export const useGetSession = (sessionId: string | null) => {
  return useQuery({
    queryKey: playKeys.session(sessionId ?? SKIP_KEY),
    queryFn: sessionId ? () => fetchSession(sessionId) : skipToken,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });
};
