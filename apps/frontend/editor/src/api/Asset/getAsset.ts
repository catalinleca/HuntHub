import { useQuery } from '@tanstack/react-query';
import type { Asset } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { queryFnOrSkip } from '@/utils';
import { assetKeys } from './keys';

const fetchAsset = async (assetId: number): Promise<Asset> => {
  const { data } = await apiClient.get<Asset>(`/assets/${assetId}`);
  return data;
};

export const useGetAsset = (assetId?: number | null) => {
  return useQuery({
    queryKey: assetKeys.detail(assetId ?? 0),
    queryFn: queryFnOrSkip(fetchAsset, assetId),
    staleTime: 1000 * 60 * 5,
  });
};
