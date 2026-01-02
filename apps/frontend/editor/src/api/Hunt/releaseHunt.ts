import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReleaseResult, ReleaseHuntRequest } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

interface ReleaseHuntParams {
  huntId: number;
  request: ReleaseHuntRequest;
}

const releaseHunt = async ({ huntId, request }: ReleaseHuntParams): Promise<ReleaseResult> => {
  const response = await apiClient.put<ReleaseResult>(`/hunts/${huntId}/release`, request);
  return response.data;
};

export const useReleaseHunt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: releaseHunt,
    onSuccess: (_data, { huntId }) => {
      void queryClient.invalidateQueries({ queryKey: huntKeys.detail(huntId) });
      void queryClient.invalidateQueries({ queryKey: huntKeys.lists() });
    },
  });
};
