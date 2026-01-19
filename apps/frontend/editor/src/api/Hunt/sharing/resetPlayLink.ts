import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/http-client';
import { huntKeys } from '../keys';

interface ResetPlayLinkResponse {
  playSlug: string;
}

const resetPlayLink = async (huntId: number): Promise<ResetPlayLinkResponse> => {
  const response = await apiClient.post<ResetPlayLinkResponse>(`/hunts/${huntId}/reset-play-link`);
  return response.data;
};

export const useResetPlayLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetPlayLink,
    onSuccess: (_data, huntId) => {
      void queryClient.invalidateQueries({ queryKey: huntKeys.detail(huntId) });
    },
  });
};
