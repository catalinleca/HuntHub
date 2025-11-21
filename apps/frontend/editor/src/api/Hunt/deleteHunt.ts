import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PaginatedHuntsResponse } from '@hunthub/shared';
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
      queryClient.setQueriesData<PaginatedHuntsResponse>({ queryKey: huntKeys.lists() }, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.filter((hunt) => hunt.huntId !== huntId),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1,
          },
        };
      });

      queryClient.removeQueries({ queryKey: huntKeys.detail(huntId) });
      void queryClient.invalidateQueries({ queryKey: huntKeys.lists() });
    },
  });
};
