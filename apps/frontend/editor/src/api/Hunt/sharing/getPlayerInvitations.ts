import { useQuery } from '@tanstack/react-query';
import type { PlayerInvitation } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { queryFnOrSkip } from '@/utils/queryFnOrSkip';
import { sharingKeys } from './keys';

const fetchInvitations = async (huntId: number): Promise<PlayerInvitation[]> => {
  const response = await apiClient.get<PlayerInvitation[]>(`/hunts/${huntId}/player-invitations`);
  return response.data;
};

export const useGetPlayerInvitations = (huntId: number | undefined) => {
  return useQuery<PlayerInvitation[]>({
    queryKey: sharingKeys.invitations(huntId ?? 0),
    queryFn: queryFnOrSkip(fetchInvitations, huntId),
  });
};
