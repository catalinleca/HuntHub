import { useMutation } from '@tanstack/react-query';
import type { ValidateAnswerResponse, AnswerType, AnswerPayload } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';

interface ValidateParams {
  sessionId: string;
  answerType: AnswerType;
  payload: AnswerPayload;
}

const validateAnswer = async (
  sessionId: string,
  answerType: AnswerType,
  payload: AnswerPayload,
): Promise<ValidateAnswerResponse> => {
  const { data } = await httpClient.post<ValidateAnswerResponse>(`/play/sessions/${sessionId}/validate`, {
    answerType,
    payload,
  });
  return data;
};

export const useValidateAnswer = () => {
  const mutation = useMutation({
    mutationFn: (params: ValidateParams): Promise<ValidateAnswerResponse> =>
      validateAnswer(params.sessionId, params.answerType, params.payload),
  });

  return {
    validate: mutation.mutateAsync,
    isValidating: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
    reset: mutation.reset,
  };
};
