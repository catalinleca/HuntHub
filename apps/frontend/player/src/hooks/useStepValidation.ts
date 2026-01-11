import { useState, useEffect, useCallback } from 'react';
import type { AnswerType, AnswerPayload } from '@hunthub/shared';
import { usePlaySession } from '@/context';
import { useValidateAnswer } from '@/api';

interface ValidationState {
  isCorrect: boolean | null;
  feedback: string | null;
}

const initialState: ValidationState = {
  isCorrect: null,
  feedback: null,
};

export const useStepValidation = (huntId: number, stepIndex: number) => {
  const { sessionId } = usePlaySession();
  const validateMutation = useValidateAnswer(huntId);
  const [state, setState] = useState<ValidationState>(initialState);

  useEffect(() => {
    setState(initialState);
  }, [stepIndex]);

  const validate = useCallback(
    (answerType: AnswerType, payload: AnswerPayload) => {
      if (!sessionId) return;

      validateMutation.mutate(
        { sessionId, stepIndex, answerType, payload },
        {
          onSuccess: (data) => {
            setState({
              isCorrect: data.correct,
              feedback: data.feedback ?? null,
            });
          },
          onError: () => {
            setState({
              isCorrect: false,
              feedback: 'Something went wrong. Please try again.',
            });
          },
        },
      );
    },
    [sessionId, stepIndex, validateMutation],
  );

  return {
    validate,
    isValidating: validateMutation.isPending,
    isCorrect: state.isCorrect,
    feedback: state.feedback,
    error: validateMutation.error,
  };
};
