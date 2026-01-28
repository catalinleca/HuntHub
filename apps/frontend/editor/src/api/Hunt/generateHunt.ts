import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { GenerateHuntRequest, GenerateHuntResponse } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

const generateHunt = async (data: GenerateHuntRequest): Promise<GenerateHuntResponse> => {
  const response = await apiClient.post<GenerateHuntResponse>('/hunts/generate', data, {
    timeout: 60000,
  });
  return response.data;
};

export const useGenerateHunt = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: generateHunt,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: huntKeys.lists() });
      queryClient.setQueryData(huntKeys.detail(data.hunt.huntId), data.hunt);
    },
  });

  return {
    generateHunt: mutation.mutate,
    generateHuntAsync: mutation.mutateAsync,
    isGenerating: mutation.isPending,
    generationError: mutation.error,
    reset: mutation.reset,
  };
};
