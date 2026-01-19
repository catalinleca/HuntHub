import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Hunt, HuntAccessMode } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from '../keys';

interface UpdateAccessModeParams {
  huntId: number;
  accessMode: HuntAccessMode;
}

const updateAccessMode = async ({ huntId, accessMode }: UpdateAccessModeParams): Promise<void> => {
  await apiClient.patch(`/hunts/${huntId}/access-mode`, { accessMode });
};

export const useUpdateAccessMode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAccessMode,
    onMutate: async ({ huntId, accessMode }) => {
      await queryClient.cancelQueries({ queryKey: huntKeys.detail(huntId) });

      const previousHunt = queryClient.getQueryData<Hunt>(huntKeys.detail(huntId));

      if (previousHunt) {
        queryClient.setQueryData<Hunt>(huntKeys.detail(huntId), {
          ...previousHunt,
          accessMode,
        });
      }

      return { previousHunt };
    },
    onError: (_error, { huntId }, context) => {
      if (context?.previousHunt) {
        queryClient.setQueryData(huntKeys.detail(huntId), context.previousHunt);
      }
    },
  });
};
