import { useQuery } from '@tanstack/react-query';
import type { PaginatedAssetsResponse, AssetQueryParams, MimeTypes } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { assetKeys } from './keys';

export interface GetAssetsParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'originalFilename' | 'size';
  sortOrder?: 'asc' | 'desc';
  mimeType?: MimeTypes;
}

const fetchAssets = async (params?: GetAssetsParams): Promise<PaginatedAssetsResponse> => {
  const { data } = await apiClient.get<PaginatedAssetsResponse>('/assets', { params });
  return data;
};

export const useAssetsQuery = (params?: GetAssetsParams) => {
  return useQuery({
    queryKey: assetKeys.list(params as AssetQueryParams),
    queryFn: () => fetchAssets(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
