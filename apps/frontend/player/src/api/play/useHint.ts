import { useMutation } from '@tanstack/react-query';
import { mockRequestHint } from './mockData';

interface HintResponse {
  hint: string;
  hintsUsed: number;
  maxHints: number;
}

export const useHint = (sessionId: string | null) => {
  const mutation = useMutation<HintResponse, Error>({
    mutationFn: async () => {
      if (!sessionId) {
        throw new Error('No session');
      }
      return mockRequestHint(sessionId);
    },
  });

  return {
    requestHint: mutation.mutate,
    hint: mutation.data?.hint ?? null,
    isLoading: mutation.isPending,
    isError: mutation.isError,
  };
};
