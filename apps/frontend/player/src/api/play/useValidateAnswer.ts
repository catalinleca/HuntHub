import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HuntProgressStatus,
  type ValidateAnswerResponse,
  type AnswerType,
  type AnswerPayload,
  type SessionResponse,
} from '@hunthub/shared';
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
  });

  const advanceToNextStep = (sessionId: string, nextStepId: number | null, isComplete: boolean) => {
    queryClient.setQueryData<SessionResponse>(playKeys.session(sessionId), (old) => {
      if (!old) return old;

      if (isComplete) {
        return {
          ...old,
          status: HuntProgressStatus.Completed,
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
  };

  return {
    validate: mutation.mutateAsync,
    isValidating: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
    reset: mutation.reset,
    advanceToNextStep,
  };
};
