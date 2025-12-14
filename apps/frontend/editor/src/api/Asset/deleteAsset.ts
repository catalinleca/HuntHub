import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/http-client';
import { assetKeys } from './keys';

const deleteAsset = async (assetId: number): Promise<void> => {
  await apiClient.delete(`/assets/${assetId}`);
};

export const useDeleteAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAsset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetKeys.all() });
    },
  });
};
