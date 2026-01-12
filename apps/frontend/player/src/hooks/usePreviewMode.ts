import { useState, useEffect, useCallback, useRef } from 'react';
import type { Hunt, Step } from '@hunthub/shared';
import { loadMockPreviewHunt } from '@/api/preview/mockPreviewData';

/**
 * PostMessage types for Editor ↔ Player communication
 */
export type PreviewMessageType = 'PREVIEW_READY' | 'RENDER_HUNT' | 'JUMP_TO_STEP' | 'STEP_VALIDATED';

interface PreviewMessage {
  type: PreviewMessageType;
  hunt?: Hunt;
  stepIndex?: number;
  isCorrect?: boolean;
  feedback?: string;
}

interface UsePreviewModeReturn {
  /** Full hunt data (with answers) */
  hunt: Hunt | null;
  /** Current step (full Step with answers) */
  currentStep: Step | null;
  /** Current step index */
  stepIndex: number;
  /** Navigate to specific step */
  setStepIndex: (index: number | ((prev: number) => number)) => void;
  /** Whether running inside Editor iframe */
  isEmbedded: boolean;
  /** Total number of steps */
  totalSteps: number;
  /** Is on first step */
  isFirstStep: boolean;
  /** Is on last step */
  isLastStep: boolean;
  /** Is loading data */
  isLoading: boolean;
  /** Error message */
  error: string | null;
}

/**
 * Hook for managing preview mode state and Editor communication
 *
 * Two modes:
 * 1. Embedded: Receives hunt data via postMessage from Editor, hides toolbar
 * 2. Standalone: Loads mock hunt data after timeout, shows toolbar for navigation
 */
export const usePreviewMode = (): UsePreviewModeReturn => {
  const [hunt, setHunt] = useState<Hunt | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track if we've received a message from parent
  const receivedMessageRef = useRef(false);

  useEffect(() => {
    // Check if running in iframe
    const isInIframe = window.parent !== window;

    if (isInIframe) {
      // Signal to parent that preview is ready to receive data
      window.parent.postMessage({ type: 'PREVIEW_READY' } as PreviewMessage, '*');
    }

    const handleMessage = (event: MessageEvent<PreviewMessage>) => {
      // Basic validation - in production, also validate event.origin
      if (!event.data || typeof event.data !== 'object') {
        return;
      }

      const { type, hunt: receivedHunt, stepIndex: receivedStepIndex } = event.data;

      switch (type) {
        case 'RENDER_HUNT':
          if (receivedHunt) {
            receivedMessageRef.current = true;
            setIsEmbedded(true);
            setHunt(receivedHunt);
            setStepIndex(0);
            setIsLoading(false);
            setError(null);
          }
          break;

        case 'JUMP_TO_STEP':
          if (typeof receivedStepIndex === 'number') {
            setStepIndex(receivedStepIndex);
          }
          break;

        default:
          // Ignore unknown message types
          break;
      }
    };

    window.addEventListener('message', handleMessage);

    // Standalone fallback: if no message received after timeout, load mock data
    const timeoutId = setTimeout(() => {
      if (!receivedMessageRef.current) {
        // No message from parent - running standalone
        loadMockPreviewHunt()
          .then((mockHunt) => {
            setHunt(mockHunt);
            setIsLoading(false);
          })
          .catch((err) => {
            setError('Failed to load mock hunt data');
            setIsLoading(false);
            console.error('Failed to load mock hunt:', err);
          });
      }
    }, 500);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeoutId);
    };
  }, []);

  // Derived values
  const steps = hunt?.steps ?? [];
  const totalSteps = steps.length;
  const currentStep = steps[stepIndex] ?? null;
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  // Safe setStepIndex that clamps to valid range
  const safeSetStepIndex = useCallback(
    (indexOrUpdater: number | ((prev: number) => number)) => {
      setStepIndex((prev) => {
        const newIndex = typeof indexOrUpdater === 'function' ? indexOrUpdater(prev) : indexOrUpdater;
        return Math.max(0, Math.min(totalSteps - 1, newIndex));
      });
    },
    [totalSteps],
  );

  return {
    hunt,
    currentStep,
    stepIndex,
    setStepIndex: safeSetStepIndex,
    isEmbedded,
    totalSteps,
    isFirstStep,
    isLastStep,
    isLoading,
    error,
  };
};
