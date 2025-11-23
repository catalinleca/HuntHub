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
    onMutate: async (huntId) => {
      await queryClient.cancelQueries({ queryKey: huntKeys.lists() });

      const previousHunts = queryClient.getQueriesData<PaginatedHuntsResponse>({ queryKey: huntKeys.lists() });

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

      return { previousHunts };
    },
    onError: (_err, _huntId, context) => {
      if (context?.previousHunts) {
        context.previousHunts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (_, huntId) => {
      queryClient.removeQueries({ queryKey: huntKeys.detail(huntId) });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: huntKeys.lists() });
    },
  });
};
