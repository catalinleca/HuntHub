import { useQuery } from '@tanstack/react-query';
import type { PreviewLinkResponse } from '@hunthub/shared';
import { apiClient } from '@/services/http-client';
import { queryFnOrSkip } from '@/utils/queryFnOrSkip';
import { huntKeys } from './keys';

const fetchPreviewLink = async (huntId: number): Promise<PreviewLinkResponse> => {
  const response = await apiClient.get<PreviewLinkResponse>(`/hunts/${huntId}/preview-link`);
  return response.data;
};

export const useGetPreviewLink = (huntId?: number) => {
  return useQuery<PreviewLinkResponse>({
    queryKey: huntKeys.previewLink(huntId ?? 0),
    queryFn: queryFnOrSkip(fetchPreviewLink, huntId),
    staleTime: 50 * 60 * 1000, // 50 min cache (token valid for 1h)
  });
};
