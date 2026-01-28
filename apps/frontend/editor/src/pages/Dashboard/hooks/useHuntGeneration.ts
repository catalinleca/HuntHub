import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { GenerateHuntStyle } from '@hunthub/shared';
import { useGenerateHunt } from '@/api/Hunt';
import { useSnackbarStore } from '@/stores';

const PROMPT_MAX_LENGTH = 500;
const PROMPT_MIN_LENGTH = 10;

const ERROR_MESSAGES: Record<string, string> = {
  RATE_LIMIT_EXCEEDED: 'Generation limit reached. You can generate up to 10 hunts per hour.',
  VALIDATION_ERROR: 'Invalid prompt. Please try again.',
  SERVICE_UNAVAILABLE: 'AI service is temporarily unavailable. Please try again later.',
  GENERATION_FAILED: 'Generation failed. Please try rephrasing your prompt.',
};

const getGenerationErrorMessage = (error: AxiosError<{ code?: string }>): string => {
  const code = error.response?.data?.code;

  if (code && ERROR_MESSAGES[code]) {
    return ERROR_MESSAGES[code];
  }

  return error.message || 'Failed to generate hunt. Please try again.';
};

const readAndClearPendingPrompt = (): string => {
  const pending = sessionStorage.getItem('pendingPrompt');
  sessionStorage.removeItem('pendingPrompt');
  return pending?.slice(0, PROMPT_MAX_LENGTH) ?? '';
};

export const useHuntGeneration = () => {
  const navigate = useNavigate();
  const snackbar = useSnackbarStore();
  const { generateHuntAsync, isGenerating } = useGenerateHunt();

  const [prompt, setPrompt] = useState(readAndClearPendingPrompt);
  const [style, setStyle] = useState<GenerateHuntStyle | undefined>(undefined);

  const initialPromptRef = useRef(prompt);

  const executeGeneration = useCallback(
    async (promptToUse: string, styleToUse?: GenerateHuntStyle) => {
      const trimmedPrompt = promptToUse.trim();

      if (trimmedPrompt.length < PROMPT_MIN_LENGTH) {
        snackbar.warning('Please describe your hunt in at least 10 characters');
        return;
      }

      if (trimmedPrompt.length > PROMPT_MAX_LENGTH) {
        snackbar.warning('Prompt is too long (max 500 characters)');
        return;
      }

      try {
        const response = await generateHuntAsync({ prompt: trimmedPrompt, style: styleToUse });
        setPrompt('');
        setStyle(undefined);
        snackbar.success('Hunt created! Customize it in the editor.');
        navigate(`/editor/${response.hunt.huntId}`);
      } catch (err) {
        snackbar.error(getGenerationErrorMessage(err as AxiosError<{ code?: string }>));
      }
    },
    [generateHuntAsync, navigate, snackbar],
  );

  const generate = () => {
    void executeGeneration(prompt, style);
  };

  const handleStyleChange = (newStyle: GenerateHuntStyle | null) => {
    setStyle(newStyle ?? undefined);
  };

  useEffect(() => {
    const initialPrompt = initialPromptRef.current;

    if (!initialPrompt) {
      return;
    }

    void executeGeneration(initialPrompt);
  }, [executeGeneration]);

  return {
    prompt,
    setPrompt,
    style,
    handleStyleChange,
    generate,
    isGenerating,
  };
};
