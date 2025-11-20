import { useQuery } from '@tanstack/react-query';
import type { PaginatedHuntsResponse } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

export interface GetHuntsParams {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

const fetchHunts = async (params?: GetHuntsParams): Promise<PaginatedHuntsResponse> => {
  const response = await apiClient.get<PaginatedHuntsResponse>('/hunts', { params });
  return response.data;
};

export const useHuntsQuery = (params?: GetHuntsParams) => {
  return useQuery({
    queryKey: huntKeys.list(params),
    queryFn: () => fetchHunts(params),
    staleTime: 1000 * 60 * 5,
  });
};
