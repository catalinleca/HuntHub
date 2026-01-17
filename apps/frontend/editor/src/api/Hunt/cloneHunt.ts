import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

interface CloneHuntRequest {
  version?: number;
}

interface CloneHuntResponse {
  huntId: number;
  clonedFromHuntId: number;
  clonedFromVersion: number;
  clonedAt: string;
}

const cloneHunt = async (huntId: number, request?: CloneHuntRequest): Promise<CloneHuntResponse> => {
  const response = await apiClient.post<CloneHuntResponse>(`/hunts/${huntId}/clone`, request ?? {});
  return response.data;
};

export const useCloneHunt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ huntId, request }: { huntId: number; request?: CloneHuntRequest }) => {
      return cloneHunt(huntId, request);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: huntKeys.lists() });
    },
  });
};
