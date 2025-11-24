import { useQuery } from '@tanstack/react-query';
import { Hunt } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { huntKeys } from './keys';

const fetchHunt = async (huntId: number): Promise<Hunt> => {
  const response = await apiClient.get<Hunt>(`/hunts/${huntId}`);
  return response.data;
};

export const useGetHunt = (huntId: number | undefined) => {
  return useQuery({
    queryKey: huntKeys.detail(huntId!),
    queryFn: () => fetchHunt(huntId!),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchOnMount: false,
    enabled: !!huntId,
  });
};
