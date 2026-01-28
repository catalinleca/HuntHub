import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { PlayerSDK, type PreviewData, type ValidationMode, type HintsMap } from '@hunthub/player-sdk';
import { PlayerExporter, type Hunt } from '@hunthub/shared';
import { useGetPreviewLink } from '@/api/Hunt';
import { useCopyToClipboard } from '@/hooks';
import { useSnackbarStore } from '@/stores';
import { PhoneFrame } from '@/components/PhoneFrame';
import { PreviewControlBar } from './PreviewControlBar';
import * as S from './HuntPreview.styles';

const PLAYER_URL = import.meta.env.VITE_PLAYER_URL || 'http://localhost:5175';

const extractHints = (steps: Hunt['steps']): HintsMap => {
  if (!steps) {
    return {};
  }
  return steps.reduce<HintsMap>((acc, step) => {
    if (step.hint) {
      acc[step.stepId] = step.hint;
    }
    return acc;
  }, {});
};

interface HuntPreviewProps {
  hunt: Hunt;
  isOpen: boolean;
  selectedStepIndex: number;
}

export const HuntPreview = ({ hunt, isOpen, selectedStepIndex }: HuntPreviewProps) => {
  const [validationMode, setValidationMode] = useState<ValidationMode>('success');
  const sdkRef = useRef<PlayerSDK | null>(null);

  const { getPreviewLink, isGettingPreviewLink } = useGetPreviewLink();
  const { copy } = useCopyToClipboard();
  const snackbar = useSnackbarStore();

  const handleModeChange = (newMode: ValidationMode) => {
    setValidationMode(newMode);
    sdkRef.current?.setValidationMode(newMode);
  };

  const handleOpenInBrowser = async () => {
    try {
      const { previewUrl } = await getPreviewLink(hunt.huntId);
      window.open(previewUrl, '_blank');
    } catch {
      snackbar.error('Failed to generate preview link');
    }
  };

  const handleCopyLink = async () => {
    try {
      const { previewUrl, expiresIn } = await getPreviewLink(hunt.huntId);
      await copy(previewUrl);
      const minutes = Math.floor(expiresIn / 60);
      snackbar.success(`Preview link copied - expires in ${minutes} min`);
    } catch {
      snackbar.error('Failed to generate preview link');
    }
  };

  return (
    <S.PreviewWrapper $isOpen={isOpen}>
      <PreviewControlBar
        validationMode={validationMode}
        onModeChange={handleModeChange}
        onOpenInBrowser={handleOpenInBrowser}
        onCopyLink={handleCopyLink}
        isLoading={isGettingPreviewLink}
      />
      <PhoneFrame>
        {isOpen && (
          <PreviewIframe
            hunt={hunt}
            selectedStepIndex={selectedStepIndex}
            sdkRef={sdkRef}
            validationMode={validationMode}
          />
        )}
      </PhoneFrame>
    </S.PreviewWrapper>
  );
};

interface PreviewIframeProps {
  hunt: Hunt;
  selectedStepIndex: number;
  sdkRef: React.RefObject<PlayerSDK | null>;
  validationMode: ValidationMode;
}

const PreviewIframe = ({ hunt, selectedStepIndex, sdkRef, validationMode }: PreviewIframeProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  const previewData: PreviewData = useMemo(
    () => ({
      hunt: PlayerExporter.hunt(hunt.huntId, {
        name: hunt.name,
        description: hunt.description,
        stepOrder: hunt.stepOrder,
        coverImage: hunt.coverImage,
      }),
      steps: PlayerExporter.steps(hunt.steps ?? []),
    }),
    [hunt],
  );

  const hints = useMemo(() => extractHints(hunt.steps), [hunt.steps]);

  useEffect(() => {
    return () => {
      sdkRef.current?.destroy();
      sdkRef.current = null;
    };
  }, [sdkRef]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    sdkRef.current?.renderHunt(previewData);
  }, [isReady, previewData]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    sdkRef.current?.setValidationMode(validationMode);
  }, [isReady, validationMode]);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    sdkRef.current?.setHints(hints);
  }, [isReady, hints]);

  useEffect(() => {
    if (!isReady || selectedStepIndex < 0) {
      return;
    }
    sdkRef.current?.jumpToStep(selectedStepIndex);
  }, [isReady, selectedStepIndex]);

  const handleIframeLoad = useCallback(() => {
    if (!iframeRef.current || sdkRef.current) {
      return;
    }

    const sdk = new PlayerSDK(iframeRef.current);
    sdkRef.current = sdk;
    sdk.onReady(() => setIsReady(true));
  }, [sdkRef]);

  return <S.Iframe ref={iframeRef} src={`${PLAYER_URL}/preview`} onLoad={handleIframeLoad} title="Hunt Preview" />;
};
