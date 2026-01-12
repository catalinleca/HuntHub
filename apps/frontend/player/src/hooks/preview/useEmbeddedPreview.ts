import { useEffect, useState, useRef } from 'react';
import { EDITOR_MESSAGES, playerMessages, sendToEditor } from './types';
import type { EditorToPlayerMessage } from './types';
import type { PreviewCore } from './usePreviewCore';

interface UseEmbeddedPreviewParams {
  core: PreviewCore;
}

interface UseEmbeddedPreviewReturn {
  isEmbedded: boolean;
}

const isRunningInIframe = (): boolean => {
  return window.parent !== window;
};

export const useEmbeddedPreview = ({ core }: UseEmbeddedPreviewParams): UseEmbeddedPreviewReturn => {
  const [isEmbedded] = useState(() => isRunningInIframe());
  const hasSignaledReady = useRef(false);
  const coreRef = useRef(core);

  coreRef.current = core;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data as EditorToPlayerMessage;

      if (!message?.type) {
        return;
      }

      switch (message.type) {
        case EDITOR_MESSAGES.RENDER_HUNT: {
          coreRef.current.setHunt(message.hunt);
          break;
        }
        case EDITOR_MESSAGES.JUMP_TO_STEP: {
          coreRef.current.goToStep(message.stepIndex);
          break;
        }
      }
    };

    window.addEventListener('message', handleMessage);

    if (isEmbedded && !hasSignaledReady.current) {
      hasSignaledReady.current = true;
      sendToEditor(playerMessages.previewReady());
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isEmbedded]);

  return { isEmbedded };
};