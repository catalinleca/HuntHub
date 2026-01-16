import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ValidateAnswerResponse, AnswerType, AnswerPayload, SessionResponse } from '@hunthub/shared';
import { httpClient } from '@/services/http-client';
import { playKeys } from './keys';

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

interface ValidateParams {
  sessionId: string;
  answerType: AnswerType;
  payload: AnswerPayload;
  nextStepId: number | null;
}

export const useValidateAnswer = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (params: ValidateParams): Promise<ValidateAnswerResponse> =>
      validateAnswer(params.sessionId, params.answerType, params.payload),
    onSuccess: (data, variables) => {
      const { sessionId, nextStepId } = variables;

      if (data.correct) {
        queryClient.setQueryData<SessionResponse>(playKeys.session(sessionId), (old) => {
          if (!old) {
            return old;
          }

          if (data.isComplete) {
            return {
              ...old,
              status: 'completed',
              currentStepIndex: old.currentStepIndex + 1,
              currentStepId: null,
            };
          }

          return {
            ...old,
            currentStepIndex: old.currentStepIndex + 1,
            currentStepId: nextStepId,
          };
        });
      }
    },
  });

  return {
    validate: mutation.mutateAsync,
    isValidating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
