import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PublishResult } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

const publishHunt = async (huntId: number): Promise<PublishResult> => {
  const response = await apiClient.post<PublishResult>(`/hunts/${huntId}/publish`);
  return response.data;
};

export const usePublishHunt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishHunt,
    onSuccess: (_data, huntId) => {
      void queryClient.invalidateQueries({ queryKey: huntKeys.detail(huntId) });
      void queryClient.invalidateQueries({ queryKey: huntKeys.lists() });
    },
  });
};
