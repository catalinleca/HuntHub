import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Hunt, HuntCreate } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

const createHunt = async (data: HuntCreate): Promise<Hunt> => {
  const response = await apiClient.post<Hunt>('/hunts', data);
  return response.data;
};

export const useCreateHunt = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHunt,
    onSuccess: (newHunt) => {
      void queryClient.invalidateQueries({ queryKey: huntKeys.lists() });
      queryClient.setQueryData(huntKeys.detail(newHunt.huntId), newHunt);
    },
  });
};
