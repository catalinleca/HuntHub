import { useQuery } from '@tanstack/react-query';
import type { PaginatedAssetsResponse, AssetQueryParams } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { assetKeys } from './keys';

const fetchAssets = async (params?: AssetQueryParams): Promise<PaginatedAssetsResponse> => {
  const { data } = await apiClient.get<PaginatedAssetsResponse>('/assets', { params });
  return data;
};

export const useAssetsQuery = (params?: AssetQueryParams) => {
  return useQuery({
    queryKey: assetKeys.list(params),
    queryFn: () => fetchAssets(params),
    staleTime: 1000 * 60 * 5,
  });
};
