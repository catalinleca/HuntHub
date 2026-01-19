import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StartSessionRequest, SessionResponse } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';
import { playKeys } from './keys';

const startSession = async (playSlug: string, playerName: string, email?: string): Promise<SessionResponse> => {
  const { data } = await httpClient.post<SessionResponse>(`/play/${playSlug}/start`, {
    playerName,
    ...(email && { email }),
  });
  return data;
};

export const useStartSession = (playSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StartSessionRequest) => startSession(playSlug, request.playerName, request.email),
    onSuccess: (data: SessionResponse) => {
      queryClient.setQueryData(playKeys.session(data.sessionId), data);
    },
  });
};
