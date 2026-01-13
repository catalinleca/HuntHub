import { useMutation } from '@tanstack/react-query';
import { mockRequestHint } from './mockData';

interface HintResponse {
  hint: string;
  hintsUsed: number;
  maxHints: number;
}

interface HintParams {
  sessionId: string;
}

const requestHint = async (params: HintParams): Promise<HintResponse> => {
  return mockRequestHint(params.sessionId);
};

export const useHint = () => {
  const mutation = useMutation({
    mutationFn: requestHint,
  });

  return {
    requestHint: mutation.mutate,
    hint: mutation.data?.hint ?? null,
    hintsUsed: mutation.data?.hintsUsed ?? 0,
    maxHints: mutation.data?.maxHints ?? 0,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
};