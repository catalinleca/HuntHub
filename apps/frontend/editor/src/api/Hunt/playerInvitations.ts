import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PlayerInvitation } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { queryFnOrSkip } from '@/utils/queryFnOrSkip';
import { huntKeys } from './keys';

const fetchInvitations = async (huntId: number): Promise<PlayerInvitation[]> => {
  const response = await apiClient.get<PlayerInvitation[]>(`/hunts/${huntId}/player-invitations`);
  return response.data;
};

export const useGetPlayerInvitations = (huntId?: number) => {
  return useQuery<PlayerInvitation[]>({
    queryKey: huntKeys.invitations(huntId ?? 0),
    queryFn: queryFnOrSkip(fetchInvitations, huntId),
  });
};

interface InvitePlayerParams {
  huntId: number;
  email: string;
}

const invitePlayer = async ({ huntId, email }: InvitePlayerParams): Promise<PlayerInvitation> => {
  const response = await apiClient.post<PlayerInvitation>(`/hunts/${huntId}/player-invitations`, { email });
  return response.data;
};

export const useInvitePlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invitePlayer,
    onSuccess: (_data, { huntId }) => {
      void queryClient.invalidateQueries({ queryKey: huntKeys.invitations(huntId) });
    },
  });
};

interface RevokeInvitationParams {
  huntId: number;
  email: string;
}

const revokeInvitation = async ({ huntId, email }: RevokeInvitationParams): Promise<void> => {
  await apiClient.delete(`/hunts/${huntId}/player-invitations/${encodeURIComponent(email)}`);
};

export const useRevokeInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeInvitation,
    onSuccess: (_data, { huntId }) => {
      void queryClient.invalidateQueries({ queryKey: huntKeys.invitations(huntId) });
    },
  });
};
