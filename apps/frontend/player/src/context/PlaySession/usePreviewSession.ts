import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { SessionResponse } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';
import { playKeys } from '@/api';

const createPreviewSession = async (playSlug: string, previewToken: string): Promise<SessionResponse> => {
  const { data } = await httpClient.post<SessionResponse>(`/play/${playSlug}/start`, {
    playerName: 'Preview',
    previewToken,
  });
  return data;
};

export const usePreviewSession = (playSlug: string, previewToken: string) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['previewSession', playSlug, previewToken],
    queryFn: async () => {
      const session = await createPreviewSession(playSlug, previewToken);
      // Also cache under the session key for step fetching
      queryClient.setQueryData(playKeys.session(session.sessionId), session);
      return session;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
};
