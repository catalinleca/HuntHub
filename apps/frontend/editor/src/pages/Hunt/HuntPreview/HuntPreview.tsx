import { useRef, useEffect, useCallback, useMemo } from 'react';
import { PlayerSDK, PLAYER_MESSAGES, type PreviewData } from '@hunthub/player-sdk';
import { PlayerExporter, type Hunt } from '@hunthub/shared';
import * as S from './HuntPreview.styles';

const PLAYER_URL = import.meta.env.VITE_PLAYER_URL || 'http://localhost:5175';

interface HuntPreviewProps {
  hunt: Hunt;
  isOpen: boolean;
  selectedStepIndex: number;
}

export const HuntPreview = ({ hunt, isOpen, selectedStepIndex }: HuntPreviewProps) => {
  return (
    <S.Container $isOpen={isOpen}>
      {isOpen && <PreviewIframe hunt={hunt} selectedStepIndex={selectedStepIndex} />}
    </S.Container>
  );
};

interface PreviewIframeProps {
  hunt: Hunt;
  selectedStepIndex: number;
}

const PreviewIframe = ({ hunt, selectedStepIndex }: PreviewIframeProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sdkRef = useRef<PlayerSDK | null>(null);

  // Sanitize hunt data - strip answers before sending to Player
  const previewData: PreviewData = useMemo(() => {
    return {
      hunt: PlayerExporter.hunt(hunt.huntId, {
        name: hunt.name,
        description: hunt.description,
        stepOrder: hunt.stepOrder,
        coverImage: hunt.coverImage,
      }),
      steps: PlayerExporter.steps(hunt.steps ?? []),
    };
  }, [hunt]);

  useEffect(() => {
    return () => {
      sdkRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    sdkRef.current?.renderHunt(previewData);
  }, [previewData]);

  useEffect(() => {
    if (selectedStepIndex >= 0) {
      sdkRef.current?.jumpToStep(selectedStepIndex);
    }
  }, [selectedStepIndex]);

  const handleIframeLoad = useCallback(() => {
    if (!iframeRef.current || sdkRef.current) {
      return;
    }

    const sdk = new PlayerSDK(iframeRef.current);
    sdkRef.current = sdk;

    sdk.onReady(() => {
      sdk.renderHunt(previewData);
      if (selectedStepIndex >= 0) {
        sdk.jumpToStep(selectedStepIndex);
      }
    });

    sdk.onMessage((msg) => {
      if (msg.type === PLAYER_MESSAGES.STEP_VALIDATED) {
        console.log('Step validated:', msg.isCorrect, msg.feedback);
      }
    });
  }, [previewData, selectedStepIndex]);

  return <S.Iframe ref={iframeRef} src={`${PLAYER_URL}/preview`} onLoad={handleIframeLoad} title="Hunt Preview" />;
};
