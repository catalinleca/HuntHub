import { useQuery } from '@tanstack/react-query';
import type { HuntInfoResponse } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';
import { playKeys } from './keys';

const fetchHuntInfo = async (playSlug: string): Promise<HuntInfoResponse> => {
  const { data } = await httpClient.get<HuntInfoResponse>(`/play/${playSlug}`);
  return data;
};

export const useGetHuntInfo = (playSlug: string) => {
  return useQuery({
    queryKey: playKeys.huntInfo(playSlug),
    queryFn: () => fetchHuntInfo(playSlug),
    retry: false, // Don't retry on 404
  });
};
