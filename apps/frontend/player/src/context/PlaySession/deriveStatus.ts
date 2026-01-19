import type { UseQueryResult } from '@tanstack/react-query';
import type { SessionResponse, StepResponse } from '@hunthub/shared';
import { HuntProgressStatus } from '@hunthub/shared';
import { SessionStatus } from './types';

export const deriveStatus = (
  sessionQuery: UseQueryResult<SessionResponse>,
  stepQuery: UseQueryResult<StepResponse>,
): SessionStatus => {
  if (sessionQuery.error || stepQuery.error) {
    return SessionStatus.Error;
  }

  if (sessionQuery.isLoading) {
    return SessionStatus.Loading;
  }

  const session = sessionQuery.data;

  if (!session) {
    return SessionStatus.Identifying;
  }

  if (session.status === HuntProgressStatus.Completed) {
    return SessionStatus.Completed;
  }

  if (stepQuery.isLoading) {
    return SessionStatus.Loading;
  }

  return SessionStatus.Playing;
};
