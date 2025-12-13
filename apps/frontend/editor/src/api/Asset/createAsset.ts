import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Asset, AssetCreate } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { assetKeys } from './keys';

const createAsset = async (assetData: AssetCreate): Promise<Asset> => {
  const { data } = await apiClient.post<Asset>('/assets', assetData);
  return data;
};

export const useCreateAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAsset,
    onSuccess: () => {
      // Invalidate all asset lists to refetch with the new asset
      queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
    },
  });
};
