import { useRef, useEffect, useCallback } from 'react';
import { PlayerSDK, PLAYER_MESSAGES } from '@hunthub/player-sdk';
import type { Hunt } from '@hunthub/shared';
import * as S from './HuntPreview.styles';

const PLAYER_URL = import.meta.env.VITE_PLAYER_URL || 'http://localhost:5175';

interface HuntPreviewProps {
  hunt: Hunt;
  isOpen: boolean;
  selectedStepIndex: number;
}

export const HuntPreview = ({ hunt, isOpen, selectedStepIndex }: HuntPreviewProps) => {
  if (!isOpen) {
    return null;
  }

  return <PreviewIframe hunt={hunt} selectedStepIndex={selectedStepIndex} />;
};

interface PreviewIframeProps {
  hunt: Hunt;
  selectedStepIndex: number;
}

const PreviewIframe = ({ hunt, selectedStepIndex }: PreviewIframeProps) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const sdkRef = useRef<PlayerSDK | null>(null);

  useEffect(() => {
    return () => {
      sdkRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    sdkRef.current?.renderHunt(hunt);
  }, [hunt]);

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
      sdk.renderHunt(hunt);
      if (selectedStepIndex >= 0) {
        sdk.jumpToStep(selectedStepIndex);
      }
    });

    sdk.onMessage((msg) => {
      if (msg.type === PLAYER_MESSAGES.STEP_VALIDATED) {
        console.log('Step validated:', msg.isCorrect, msg.feedback);
      }
    });
  }, [hunt, selectedStepIndex]);

  return (
    <S.Container>
      <S.Iframe ref={iframeRef} src={`${PLAYER_URL}/preview`} onLoad={handleIframeLoad} title="Hunt Preview" />
    </S.Container>
  );
};
