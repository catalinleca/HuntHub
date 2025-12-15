import { useRef, useCallback } from 'react';
import { Typography, Stack, useTheme } from '@mui/material';
import { useWavesurfer } from '@wavesurfer/react';
import { WaveformIcon, PlayIcon, PauseIcon } from '@phosphor-icons/react';
import * as S from './AudioPreview.styles';

interface PreviewableAsset {
  url: string;
}

export interface AudioPreviewProps {
  asset?: PreviewableAsset | null;
  onClick?: () => void;
  emptyText?: string;
  height?: number | string;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const AudioPreview = ({
  asset,
  onClick,
  emptyText = 'Click to select audio',
  height = 120,
}: AudioPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isClickable = !!onClick;

  const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: asset?.url,
    height: 50,
    barWidth: 3,
    barGap: 2,
    barRadius: 2,
    cursorWidth: 0,
    dragToSeek: true,
    waveColor: theme.palette.grey[400],
    progressColor: theme.palette.primary.main,
  });

  const duration = wavesurfer?.getDuration() ?? 0;

  const handlePlayPause = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      wavesurfer?.playPause();
    },
    [wavesurfer],
  );

  if (!asset) {
    return (
      <S.EmptyState onClick={onClick} $clickable={isClickable} $height={height}>
        <WaveformIcon size={48} weight="light" />
        <Typography variant="body2" color="text.secondary" mt={1}>
          {emptyText}
        </Typography>
      </S.EmptyState>
    );
  }

  return (
    <S.Container onClick={onClick} $clickable={isClickable} $height={height}>
      <Stack direction="row" alignItems="center" gap={2} height="100%">
        <S.PlayButton onClick={handlePlayPause}>
          {isPlaying ? <PauseIcon size={24} weight="fill" /> : <PlayIcon size={24} weight="fill" />}
        </S.PlayButton>

        <Stack flex={1} minWidth={0}>
          <S.WaveformContainer ref={containerRef} />
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" color="text.secondary">
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatTime(duration)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </S.Container>
  );
};
