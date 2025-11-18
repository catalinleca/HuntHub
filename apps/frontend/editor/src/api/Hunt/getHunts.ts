import { useQuery } from '@tanstack/react-query';
import { Hunt } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

const fetchHunts = async (): Promise<Hunt[]> => {
  const response = await apiClient.get<Hunt[]>('/hunts');
  return response.data;
};

export const useGetHunts = () => {
  return useQuery({
    queryKey: huntKeys.lists(),
    queryFn: fetchHunts,
    staleTime: 1000 * 60 * 5,
  });
};
