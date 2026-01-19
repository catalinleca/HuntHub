import type { UseQueryResult } from '@tanstack/react-query';
import type { SessionResponse, StepResponse } from '@hunthub/shared';
import { HuntProgressStatus } from '@hunthub/shared';
import type { SessionStatus } from './types';

export const deriveStatus = (
  sessionQuery: UseQueryResult<SessionResponse>,
  stepQuery: UseQueryResult<StepResponse>,
): SessionStatus => {
  if (sessionQuery.error || stepQuery.error) {
    return 'error';
  }

  if (sessionQuery.isLoading) {
    return 'loading';
  }

  const session = sessionQuery.data;

  if (!session) {
    return 'identifying';
  }

  if (session.status === HuntProgressStatus.Completed) {
    return 'completed';
  }

  if (stepQuery.isLoading) {
    return 'loading';
  }

  return 'playing';
};
