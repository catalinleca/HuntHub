import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ValidateAnswerResponse, AnswerType, AnswerPayload } from '@hunthub/shared';
import { playKeys } from './keys';
import { mockValidateAnswer } from './mockData';

interface ValidateParams {
  sessionId: string;
  answerType: AnswerType;
  payload: AnswerPayload;
}

const validateAnswer = async (params: ValidateParams): Promise<ValidateAnswerResponse> => {
  return mockValidateAnswer(params.sessionId, params.answerType, params.payload);
};

export const useValidateAnswer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: validateAnswer,
    onSuccess: (data, variables) => {
      const { sessionId } = variables;

      if (data.correct) {
        queryClient.invalidateQueries({ queryKey: playKeys.session(sessionId) });
        queryClient.invalidateQueries({ queryKey: playKeys.currentStep(sessionId) });
        queryClient.invalidateQueries({ queryKey: playKeys.nextStep(sessionId) });
      }
    },
  });
};
