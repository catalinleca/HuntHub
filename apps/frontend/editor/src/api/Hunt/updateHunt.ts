import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Hunt, HuntUpdate, PaginatedHuntsResponse } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

interface UpdateHuntVariables {
  huntId: number;
  data: HuntUpdate;
}

const updateHunt = async ({ huntId, data }: UpdateHuntVariables): Promise<Hunt> => {
  const response = await apiClient.put<Hunt>(`/hunts/${huntId}`, data);
  return response.data;
};

export const useUpdateHunt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHunt,
    onMutate: async ({ huntId, data }) => {
      await queryClient.cancelQueries({ queryKey: huntKeys.detail(huntId) });
      await queryClient.cancelQueries({ queryKey: huntKeys.lists() });

      const previousHunt = queryClient.getQueryData<Hunt>(huntKeys.detail(huntId));
      const previousLists = queryClient.getQueriesData<PaginatedHuntsResponse>({
        queryKey: huntKeys.lists(),
      });

      if (previousHunt) {
        queryClient.setQueryData<Hunt>(huntKeys.detail(huntId), {
          ...previousHunt,
          ...data,
        });
      }

      queryClient.setQueriesData<PaginatedHuntsResponse>({ queryKey: huntKeys.lists() }, (old) => {
        if (!old) {
          return old;
        }
        return {
          ...old,
          data: old.data.map((hunt) => (hunt.huntId === huntId ? { ...hunt, ...data } : hunt)),
        };
      });

      return { previousHunt, previousLists, huntId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousHunt) {
        queryClient.setQueryData(huntKeys.detail(context.huntId), context.previousHunt);
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: (updatedHunt) => {
      queryClient.setQueryData(huntKeys.detail(updatedHunt.huntId), updatedHunt);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: huntKeys.lists() });
    },
  });
};
