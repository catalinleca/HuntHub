import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/http-client';
import { sharingKeys } from './keys';

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
      void queryClient.invalidateQueries({ queryKey: sharingKeys.invitations(huntId) });
    },
  });
};
