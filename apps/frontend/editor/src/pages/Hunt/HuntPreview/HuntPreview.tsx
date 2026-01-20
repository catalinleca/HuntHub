import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { ToggleButtonGroup, ToggleButton, Typography, Stack, Button, Menu, MenuItem } from '@mui/material';
import { CheckIcon, XIcon, CaretDownIcon, ArrowSquareOutIcon, CopyIcon } from '@phosphor-icons/react';
import { PlayerSDK, type PreviewData, type ValidationMode, type HintsMap } from '@hunthub/player-sdk';
import { PlayerExporter, type Hunt } from '@hunthub/shared';
import { useGetPreviewLink } from '@/api/Hunt';
import { useCopyToClipboard } from '@/hooks';
import { useSnackbarStore } from '@/stores';
import * as S from './HuntPreview.styles';

const PLAYER_URL = import.meta.env.VITE_PLAYER_URL || 'http://localhost:5175';

const extractHints = (steps: Hunt['steps']): HintsMap => {
  if (!steps) return {};
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
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const sdkRef = useRef<PlayerSDK | null>(null);

  const { getPreviewLink, isGettingPreviewLink } = useGetPreviewLink();
  const { copy } = useCopyToClipboard();
  const snackbar = useSnackbarStore();

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: ValidationMode | null) => {
    if (newMode !== null) {
      setValidationMode(newMode);
      sdkRef.current?.setValidationMode(newMode);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleOpenInBrowser = async () => {
    handleMenuClose();
    try {
      const { previewUrl } = await getPreviewLink(hunt.huntId);
      window.open(previewUrl, '_blank');
    } catch {
      snackbar.error('Failed to generate preview link');
    }
  };

  const handleCopyLink = async () => {
    handleMenuClose();
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Typography variant="caption" color="text.secondary">
            Simulate:
          </Typography>
          <ToggleButtonGroup value={validationMode} exclusive onChange={handleModeChange} size="small">
            <ToggleButton value="success">
              <CheckIcon size={16} />
              Success
            </ToggleButton>
            <ToggleButton value="fail">
              <XIcon size={16} />
              Fail
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Button
          size="small"
          variant="outlined"
          onClick={handleMenuOpen}
          endIcon={<CaretDownIcon size={14} />}
          disabled={isGettingPreviewLink}
        >
          Preview Hunt
        </Button>
        <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
          <MenuItem onClick={handleOpenInBrowser}>
            <ArrowSquareOutIcon size={18} style={{ marginRight: 8 }} />
            Open in Browser
          </MenuItem>
          <MenuItem onClick={handleCopyLink}>
            <CopyIcon size={18} style={{ marginRight: 8 }} />
            Copy Link
          </MenuItem>
        </Menu>
      </Stack>
      <S.Container>
        {isOpen && (
          <PreviewIframe
            hunt={hunt}
            selectedStepIndex={selectedStepIndex}
            sdkRef={sdkRef}
            validationMode={validationMode}
          />
        )}
      </S.Container>
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
    if (!isReady) return;
    sdkRef.current?.renderHunt(previewData);
  }, [isReady, previewData]);

  useEffect(() => {
    if (!isReady) return;
    sdkRef.current?.setValidationMode(validationMode);
  }, [isReady, validationMode]);

  useEffect(() => {
    if (!isReady) return;
    sdkRef.current?.setHints(hints);
  }, [isReady, hints]);

  useEffect(() => {
    if (!isReady || selectedStepIndex < 0) return;
    sdkRef.current?.jumpToStep(selectedStepIndex);
  }, [isReady, selectedStepIndex]);

  const handleIframeLoad = useCallback(() => {
    if (!iframeRef.current || sdkRef.current) return;

    const sdk = new PlayerSDK(iframeRef.current);
    sdkRef.current = sdk;
    sdk.onReady(() => setIsReady(true));
  }, [sdkRef]);

  return <S.Iframe ref={iframeRef} src={`${PLAYER_URL}/preview`} onLoad={handleIframeLoad} title="Hunt Preview" />;
};
