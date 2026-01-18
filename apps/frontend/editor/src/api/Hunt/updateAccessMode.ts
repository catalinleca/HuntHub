import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { HuntAccessMode } from '@hunthub/shared';
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
    onSuccess: (_data, { huntId }) => {
      void queryClient.invalidateQueries({ queryKey: huntKeys.detail(huntId) });
    },
  });
};
