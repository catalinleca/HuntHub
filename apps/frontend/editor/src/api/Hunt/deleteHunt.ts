import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

const deleteHunt = async (huntId: number): Promise<void> => {
  await apiClient.delete(`/hunts/${huntId}`);
};

export const useDeleteHunt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHunt,
    onSuccess: (_, huntId) => {
      queryClient.removeQueries({ queryKey: huntKeys.detail(huntId) });
      void queryClient.invalidateQueries({ queryKey: huntKeys.lists() });
    },
  });
};
