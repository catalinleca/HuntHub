import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Hunt } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

const saveHunt = async (hunt: Hunt): Promise<Hunt> => {
  const response = await apiClient.put<Hunt>(`/hunts/${hunt.huntId}/save`, hunt);
  return response.data;
};

export const useSaveHunt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveHunt,
    onSuccess: (savedHunt) => {
      queryClient.setQueryData(huntKeys.detail(savedHunt.huntId), savedHunt);
      void queryClient.invalidateQueries({ queryKey: huntKeys.lists() });
    },
  });
};
