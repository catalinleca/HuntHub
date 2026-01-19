import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PlayerInvitation } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { sharingKeys } from './keys';

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
      void queryClient.invalidateQueries({ queryKey: sharingKeys.invitations(huntId) });
    },
  });
};
