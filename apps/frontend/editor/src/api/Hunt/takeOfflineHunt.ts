import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TakeOfflineResult, TakeOfflineRequest } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

interface TakeOfflineHuntParams {
  huntId: number;
  request: TakeOfflineRequest;
}

const takeOfflineHunt = async ({ huntId, request }: TakeOfflineHuntParams): Promise<TakeOfflineResult> => {
  const response = await apiClient.delete<TakeOfflineResult>(`/hunts/${huntId}/release`, {
    data: request,
  });
  return response.data;
};

export const useTakeOfflineHunt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: takeOfflineHunt,
    onSuccess: (_data, { huntId }) => {
      void queryClient.invalidateQueries({ queryKey: huntKeys.detail(huntId) });
      void queryClient.invalidateQueries({ queryKey: huntKeys.lists() });
    },
  });
};
