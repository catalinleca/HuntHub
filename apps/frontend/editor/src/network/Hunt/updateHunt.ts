import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Hunt, HuntUpdate } from '@hunthub/shared';
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
      const previousHunt = queryClient.getQueryData<Hunt>(huntKeys.detail(huntId));

      if (previousHunt) {
        queryClient.setQueryData<Hunt>(huntKeys.detail(huntId), {
          ...previousHunt,
          ...data,
        });
      }

      return { previousHunt };
    },
    onError: (err, { huntId }, context) => {
      if (context?.previousHunt) {
        queryClient.setQueryData(huntKeys.detail(huntId), context.previousHunt);
      }
    },
    onSuccess: (updatedHunt) => {
      queryClient.setQueryData(huntKeys.detail(updatedHunt.huntId), updatedHunt);
      void queryClient.invalidateQueries({ queryKey: huntKeys.lists() });
    },
  });
};
