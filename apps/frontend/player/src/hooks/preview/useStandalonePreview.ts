import { useEffect } from 'react';
import { loadMockPreviewHunt } from '@/api/preview';
import type { PreviewCore } from './usePreviewCore';

const STANDALONE_DETECTION_DELAY_MS = 500;

interface UseStandalonePreviewParams {
  core: PreviewCore;
  isEmbedded: boolean;
}

export const useStandalonePreview = ({ core, isEmbedded }: UseStandalonePreviewParams) => {
  const { hunt, setHunt, setLoading, setError } = core;

  useEffect(() => {
    if (isEmbedded) {
      return;
    }

    if (hunt) {
      return;
    }

    const loadMockHuntData = async () => {
      setLoading(true);

      try {
        const mockHunt = await loadMockPreviewHunt();
        setHunt(mockHunt);
      } catch {
        setError('Failed to load mock hunt data');
      }
    };

    const timeoutId = setTimeout(() => {
      loadMockHuntData();
    }, STANDALONE_DETECTION_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isEmbedded, hunt, setHunt, setLoading, setError]);
};