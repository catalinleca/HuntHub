import { useEffect, useRef, useState } from 'react';
import { usePreviewCore } from '@/hooks/preview/usePreviewCore';
import {
  EDITOR_MESSAGES,
  playerMessages,
  sendToEditor,
  type EditorToPlayerMessage,
  type ValidationMode,
  type HintsMap,
} from '@hunthub/player-sdk';
import { PreviewContent } from './PreviewContent';

export const EmbeddedPreview = () => {
  const core = usePreviewCore();
  const [validationMode, setValidationMode] = useState<ValidationMode>('success');
  const [hints, setHints] = useState<HintsMap>({});
  const hasSignaledReady = useRef(false);
  const coreRef = useRef(core);
  coreRef.current = core;

  useEffect(() => {
    const handleEditorMessage = (event: MessageEvent) => {
      const message = event.data as EditorToPlayerMessage;
      if (!message?.type) {
        return;
      }

      switch (message.type) {
        case EDITOR_MESSAGES.RENDER_HUNT:
          coreRef.current.setHunt({ hunt: message.hunt, steps: message.steps });
          break;
        case EDITOR_MESSAGES.JUMP_TO_STEP:
          coreRef.current.goToStep(message.stepIndex);
          break;
        case EDITOR_MESSAGES.SET_VALIDATION_MODE:
          setValidationMode(message.mode);
          break;
        case EDITOR_MESSAGES.SET_HINTS:
          setHints(message.hints);
          break;
      }
    };

    window.addEventListener('message', handleEditorMessage);

    if (!hasSignaledReady.current) {
      hasSignaledReady.current = true;
      sendToEditor(playerMessages.previewReady());
    }

    return () => window.removeEventListener('message', handleEditorMessage);
  }, []);

  const currentStepHint = core.currentStep ? hints[core.currentStep.stepId] : undefined;

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
      validationMode={validationMode}
      previewHint={currentStepHint}
      onPrev={core.goToPrevStep}
      onNext={core.goToNextStep}
      emptyStateMessage="Waiting for hunt data from Editor..."
    />
  );
};
