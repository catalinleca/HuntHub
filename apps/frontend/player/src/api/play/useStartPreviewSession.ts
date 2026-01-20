import { useQuery } from '@tanstack/react-query';
import type { PreviewSessionResponse } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';
import { queryFnOrSkip } from '@/utils/queryFnOrSkip';
import { playKeys, SKIP_KEY } from './keys';

const startPreviewSession = async (token: string): Promise<PreviewSessionResponse> => {
  const { data } = await httpClient.post<PreviewSessionResponse>('/preview/sessions', {
    previewToken: token,
  });
  return data;
};

export const useStartPreviewSession = (token: string | null) => {
  return useQuery({
    queryKey: playKeys.previewSession(token ?? SKIP_KEY),
    queryFn: queryFnOrSkip(startPreviewSession, token),
    staleTime: Infinity,
    retry: false,
  });
};
