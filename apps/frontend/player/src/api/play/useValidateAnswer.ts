import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ValidateAnswerResponse, AnswerType, AnswerPayload } from '@hunthub/shared';
import { playKeys } from './keys';
import { mockValidateAnswer } from './mockData';

interface ValidateParams {
  sessionId: string;
  stepIndex: number;
  answerType: AnswerType;
  payload: AnswerPayload;
}

const validateAnswer = async (params: ValidateParams): Promise<ValidateAnswerResponse> => {
  return mockValidateAnswer(params.sessionId, params.stepIndex, params.answerType, params.payload);
};

export const useValidateAnswer = (huntId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: validateAnswer,
    onSuccess: (data, variables) => {
      // Update session cache with new currentStepIndex from BE
      queryClient.setQueryData(playKeys.session(huntId), (old: unknown) => {
        if (!old || typeof old !== 'object') {
          return old;
        }

        return {
          ...old,
          currentStepIndex: data.currentStepIndex,
        };
      });

      // Cache the next step if provided
      if (data.correct && data.nextStep) {
        queryClient.setQueryData(playKeys.step(huntId, variables.stepIndex + 1), data.nextStep);
      }
    },
  });
};
