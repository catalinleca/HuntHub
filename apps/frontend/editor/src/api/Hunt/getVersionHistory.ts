import { useQuery } from '@tanstack/react-query';
import type { VersionHistoryResponse } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { queryFnOrSkip } from '@/utils/queryFnOrSkip';
import { huntKeys } from './keys';

const fetchVersionHistory = async (huntId: number): Promise<VersionHistoryResponse> => {
  const response = await apiClient.get<VersionHistoryResponse>(`/hunts/${huntId}/versions`);
  return response.data;
};

export const useGetVersionHistory = (huntId: number | undefined) => {
  return useQuery<VersionHistoryResponse>({
    queryKey: huntKeys.versions(huntId ?? 0),
    queryFn: queryFnOrSkip(fetchVersionHistory, huntId),
  });
};
