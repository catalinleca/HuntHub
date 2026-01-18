import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { HuntAccessMode, Hunt } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

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
      const previous = queryClient.getQueryData<Hunt>(huntKeys.detail(huntId));
      if (previous) {
        queryClient.setQueryData<Hunt>(huntKeys.detail(huntId), { ...previous, accessMode });
      }
      return { previous };
    },
    onError: (_err, { huntId }, context) => {
      if (context?.previous) {
        queryClient.setQueryData(huntKeys.detail(huntId), context.previous);
      }
      void queryClient.invalidateQueries({ queryKey: huntKeys.detail(huntId) });
    },
  });
};
