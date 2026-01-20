import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StartSessionRequest, SessionResponse } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';
import { playKeys } from './keys';

const startSession = async (request: StartSessionRequest): Promise<SessionResponse> => {
  const { data } = await httpClient.post<SessionResponse>('/play/sessions', request);
  return data;
};

export const useStartSession = (playSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: Omit<StartSessionRequest, 'playSlug'>) => startSession({ ...request, playSlug }),
    onSuccess: (data: SessionResponse) => {
      queryClient.setQueryData(playKeys.session(data.sessionId), data);
    },
  });
};
