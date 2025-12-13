import { useQuery } from '@tanstack/react-query';
import type { Asset } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { assetKeys } from './keys';

const fetchAsset = async (assetId: number): Promise<Asset> => {
  const { data } = await apiClient.get<Asset>(`/assets/${assetId}`);
  return data;
};

export const useGetAsset = (assetId: number | null | undefined) => {
  return useQuery({
    queryKey: assetKeys.detail(assetId!),
    queryFn: () => fetchAsset(assetId!),
    enabled: !!assetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
