import { useMutation } from '@tanstack/react-query';
import type { HintResponse } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';

const requestHint = async (sessionId: string): Promise<HintResponse> => {
  const { data } = await httpClient.post<HintResponse>(`/play/sessions/${sessionId}/hint`);
  return data;
};

interface HintParams {
  sessionId: string;
}

export const useHint = () => {
  const mutation = useMutation({
    mutationFn: (params: HintParams): Promise<HintResponse> => requestHint(params.sessionId),
  });

  return {
    requestHint: mutation.mutate,
    hint: mutation.data?.hint ?? null,
    hintsUsed: mutation.data?.hintsUsed ?? 0,
    maxHints: mutation.data?.maxHints ?? 0,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
};
