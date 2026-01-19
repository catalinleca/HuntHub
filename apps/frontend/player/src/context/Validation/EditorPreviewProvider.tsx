import { useState, useCallback, type ReactNode } from 'react';
import type { AnswerType, AnswerPayload } from '@hunthub/shared';
import type { ValidationMode } from '@hunthub/player-sdk';
import { ValidationContext } from './ValidationContext';

const PREVIEW_FEEDBACK = {
  success: 'Correct!',
  fail: 'Incorrect. Try again!',
} as const;

interface EditorPreviewProviderProps {
  validationMode: ValidationMode;
  children: ReactNode;
}

export const EditorPreviewProvider = ({ validationMode, children }: EditorPreviewProviderProps) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const validate = useCallback(
    (_answerType: AnswerType, _payload: AnswerPayload) => {
      const isSuccess = validationMode === 'success';
      setIsCorrect(isSuccess);
      setFeedback(PREVIEW_FEEDBACK[validationMode]);
      setAttemptCount((prev) => prev + 1);
    },
    [validationMode],
  );

  const reset = useCallback(() => {
    setIsCorrect(null);
    setFeedback(null);
    setAttemptCount(0);
  }, []);

  return (
    <ValidationContext.Provider
      value={{
        validate,
        isValidating: false,
        isCorrect,
        feedback,
        attemptCount,
        isExpired: false,
        isExhausted: false,
        reset,
      }}
    >
      {children}
    </ValidationContext.Provider>
  );
};
