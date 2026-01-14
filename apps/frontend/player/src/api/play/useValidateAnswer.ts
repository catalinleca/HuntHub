import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ValidateAnswerResponse, AnswerType, AnswerPayload } from '@hunthub/shared';
import { playKeys } from './keys';
import { validateAnswer } from './api';

interface ValidateParams {
  sessionId: string;
  answerType: AnswerType;
  payload: AnswerPayload;
}

export const useValidateAnswer = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (params: ValidateParams): Promise<ValidateAnswerResponse> =>
      validateAnswer(params.sessionId, params.answerType, params.payload),
    onSuccess: (data, variables) => {
      const { sessionId } = variables;

      if (data.correct) {
        // Invalidate session to get updated currentStep
        // Note: Don't invalidate step queries - prefetched next step should remain in cache
        queryClient.invalidateQueries({ queryKey: playKeys.session(sessionId) });
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
