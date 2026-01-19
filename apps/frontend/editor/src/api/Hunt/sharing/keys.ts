import { huntKeys } from '../keys';

export const sharingKeys = {
  invitations: (huntId: number) => [...huntKeys.detail(huntId), 'invitations'] as const,
};
