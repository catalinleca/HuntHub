import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SessionResponse } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';
import { playKeys } from './keys';

interface StartSessionParams {
  playerName: string;
  email?: string;
  previewToken?: string;
}

const startSession = async (
  playSlug: string,
  playerName: string,
  email?: string,
  previewToken?: string,
): Promise<SessionResponse> => {
  const { data } = await httpClient.post<SessionResponse>(`/play/${playSlug}/start`, {
    playerName,
    ...(email && { email }),
    ...(previewToken && { previewToken }),
  });
  return data;
};

export const useStartSession = (playSlug: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (params: StartSessionParams) =>
      startSession(playSlug, params.playerName, params.email, params.previewToken),
    onSuccess: (data: SessionResponse) => {
      queryClient.setQueryData(playKeys.session(data.sessionId), data);
    },
  });

  return {
    startSession: mutation.mutate,
    isStartingSession: mutation.isPending,
    startSessionError: mutation.error,
  };
};
