import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StartSessionRequest, SessionResponse } from '@hunthub/shared';
import { playKeys } from './keys';
import { startSession } from './api';

export const useStartSession = (huntId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StartSessionRequest) => startSession(huntId, request.playerName, request.email),
    onSuccess: (data: SessionResponse) => {
      queryClient.setQueryData(playKeys.session(data.sessionId), data);
    },
  });
};
