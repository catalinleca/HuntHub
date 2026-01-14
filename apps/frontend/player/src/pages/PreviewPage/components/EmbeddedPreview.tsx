import { useEffect, useRef } from 'react';
import { usePreviewCore } from '@/hooks/preview/usePreviewCore';
import { EDITOR_MESSAGES, playerMessages, sendToEditor, type EditorToPlayerMessage } from '@hunthub/player-sdk';
import type { ValidationResult } from '@/context';
import { PreviewContent } from './PreviewContent';

export const EmbeddedPreview = () => {
  const core = usePreviewCore();

  const hasSignaledReady = useRef(false);
  const coreRef = useRef(core);

  coreRef.current = core;

  useEffect(() => {
    // TODO: Add origin validation (e.g., event.origin === VITE_EDITOR_ORIGIN) for production security
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as EditorToPlayerMessage;

      if (!message?.type) {
        return;
      }

      switch (message.type) {
        case EDITOR_MESSAGES.RENDER_HUNT: {
          // Pass full PreviewData { hunt, steps } to setHunt
          coreRef.current.setHunt({ hunt: message.hunt, steps: message.steps });
          break;
        }
        case EDITOR_MESSAGES.JUMP_TO_STEP: {
          coreRef.current.goToStep(message.stepIndex);
          break;
        }
      }
    };

    window.addEventListener('message', handleMessage);

    if (!hasSignaledReady.current) {
      hasSignaledReady.current = true;
      sendToEditor(playerMessages.previewReady());
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleValidated = (result: ValidationResult) => {
    sendToEditor(playerMessages.stepValidated(result.isCorrect, result.feedback));
  };

  return (
    <PreviewContent
      hunt={core.hunt}
      currentStep={core.currentStep}
      stepIndex={core.stepIndex}
      totalSteps={core.totalSteps}
      isLastStep={core.isLastStep}
      isLoading={core.isLoading}
      error={core.error}
      showToolbar={false}
      onValidated={handleValidated}
      onPrev={core.goToPrevStep}
      onNext={core.goToNextStep}
      emptyStateMessage="Waiting for hunt data from Editor..."
    />
  );
};
