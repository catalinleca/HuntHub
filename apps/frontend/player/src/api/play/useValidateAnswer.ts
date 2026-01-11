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

export const useValidateAnswer = (huntId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: validateAnswer,
    onSuccess: (data, variables) => {
      const { sessionId } = variables;

      if (data.correct) {
        // Invalidate session to refetch updated currentStepIndex
        queryClient.invalidateQueries({ queryKey: playKeys.session(huntId) });
        // Invalidate current step - will refetch with new step
        queryClient.invalidateQueries({ queryKey: playKeys.currentStep(sessionId) });
        // Invalidate next step - the "next" becomes "current", need new next
        queryClient.invalidateQueries({ queryKey: playKeys.nextStep(sessionId) });
      }
    },
  });
};
