import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GenerateHuntStyle } from '@hunthub/shared';
import { useGenerateHunt } from '@/api/Hunt';
import { useSnackbarStore } from '@/stores';

const PROMPT_MAX_LENGTH = 500;
const PROMPT_MIN_LENGTH = 10;

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

  const hasAutoTriggeredRef = useRef(false);

  const generate = async () => {
    const trimmedPrompt = prompt.trim();

    if (trimmedPrompt.length < PROMPT_MIN_LENGTH) {
      snackbar.warning('Please describe your hunt in at least 10 characters');
      return;
    }

    if (trimmedPrompt.length > PROMPT_MAX_LENGTH) {
      snackbar.warning('Prompt is too long (max 500 characters)');
      return;
    }

    try {
      const response = await generateHuntAsync({ prompt: trimmedPrompt, style });
      setPrompt('');
      setStyle(undefined);
      snackbar.success('Hunt created! Customize it in the editor.');
      navigate(`/editor/${response.hunt.huntId}`);
    } catch (err) {
      handleGenerationError(err);
    }
  };

  const handleGenerationError = (err: unknown) => {
    const axiosError = err as { response?: { data?: { code?: string; message?: string } } };
    const code = axiosError.response?.data?.code;
    const message = axiosError.response?.data?.message;

    const errorMessages: Record<string, string> = {
      RATE_LIMIT_EXCEEDED: 'Generation limit reached. You can generate up to 10 hunts per hour.',
      VALIDATION_ERROR: message || 'Invalid prompt. Please try again.',
      SERVICE_UNAVAILABLE: 'AI service is temporarily unavailable. Please try again later.',
      GENERATION_FAILED: 'Generation failed. Please try rephrasing your prompt.',
    };

    snackbar.error(errorMessages[code ?? ''] ?? message ?? 'Failed to generate hunt. Please try again.');
  };

  const handleStyleChange = (newStyle: GenerateHuntStyle | null) => {
    setStyle(newStyle ?? undefined);
  };

  useEffect(() => {
    const hasValidPrompt = prompt.trim().length >= PROMPT_MIN_LENGTH;

    if (hasAutoTriggeredRef.current || !hasValidPrompt) {
      return;
    }

    hasAutoTriggeredRef.current = true;
    generate();
  }, []);

  return {
    prompt,
    setPrompt,
    style,
    handleStyleChange,
    generate,
    isGenerating,
  };
};
