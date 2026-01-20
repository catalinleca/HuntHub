import { useMutation } from '@tanstack/react-query';
import type { NavigateRequest, NavigateResponse } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';

interface NavigateParams extends NavigateRequest {
  sessionId: string;
}

const navigateToStep = async (sessionId: string, stepId: number): Promise<NavigateResponse> => {
  const { data } = await httpClient.post<NavigateResponse>(`/play/sessions/${sessionId}/navigate`, {
    stepId,
  });
  return data;
};

export const useNavigateToStep = () => {
  const mutation = useMutation({
    mutationFn: (params: NavigateParams): Promise<NavigateResponse> => navigateToStep(params.sessionId, params.stepId),
  });

  return {
    navigateToStep: mutation.mutateAsync,
    isNavigating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
