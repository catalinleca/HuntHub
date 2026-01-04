import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Hunt, PaginatedHuntsResponse } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

const fetchHunt = async (huntId: number): Promise<Hunt> => {
  const response = await apiClient.get<Hunt>(`/hunts/${huntId}`);
  return response.data;
};

export const useGetHunt = (huntId?: number | null) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: huntKeys.detail(huntId!),
    queryFn: () => fetchHunt(huntId!),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    enabled: !!huntId,
    initialData: () => {
      if (!huntId) {
        return undefined;
      }

      const queries = queryClient.getQueriesData<PaginatedHuntsResponse>({
        queryKey: huntKeys.lists(),
      });

      for (const [, data] of queries) {
        const hunt = data?.data?.find((h) => h.huntId === huntId);
        // Only use as initialData if it has steps (complete data from detail API)
        // List API returns hunts without steps - using that causes empty timeline on first load
        if (hunt?.steps && hunt.steps.length > 0) {
          return hunt;
        }
      }

      return undefined;
    },
    initialDataUpdatedAt: () => {
      if (!huntId) {
        return undefined;
      }

      const queries = queryClient.getQueriesData<PaginatedHuntsResponse>({
        queryKey: huntKeys.lists(),
      });

      for (const [queryKey, data] of queries) {
        if (data?.data?.some((h) => h.huntId === huntId)) {
          return queryClient.getQueryState(queryKey)?.dataUpdatedAt;
        }
      }

      return undefined;
    },
  });
};
