import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { StartSessionRequest, StartSessionResponse } from '@hunthub/shared';
import { playKeys } from './keys';
import { mockStartSession } from './mockData';

// TODO: Replace with real API call when backend is ready
const startSession = async (huntId: number, request: StartSessionRequest): Promise<StartSessionResponse> => {
  return mockStartSession(huntId, request.playerName, request.email);
};

export const useStartSession = (huntId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StartSessionRequest) => startSession(huntId, request),
    onSuccess: (data) => {
      queryClient.setQueryData(playKeys.session(data.sessionId), data);
    },
  });
};
