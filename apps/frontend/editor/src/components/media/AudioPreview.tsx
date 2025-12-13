import { Box, Typography, Stack, IconButton, LinearProgress } from '@mui/material';
import { WaveformIcon, PlayIcon, PauseIcon } from '@phosphor-icons/react';
import { useState, useRef, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import type { Asset } from '@hunthub/shared';

export interface AudioPreviewProps {
  asset?: Asset | null;
  onClick?: () => void;
  emptyText?: string;
  height?: number | string;
}

const formatDuration = (seconds: number): string => {
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
  const isClickable = !!onClick;
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Pattern 3: Clean WaveSurfer Lifecycle - single cleanup, nullify refs
  useEffect(() => {
    if (!containerRef.current || !asset?.url) {
      return;
    }

    // Clean up existing instance before creating new one
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    setIsLoading(true);

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#94a3b8',
      progressColor: '#6366f1',
      cursorColor: '#6366f1',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 60,
      normalize: true,
    });

    ws.on('ready', () => {
      setIsLoading(false);
      setDuration(ws.getDuration());
    });

    ws.on('audioprocess', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on('play', () => setIsPlaying(true));
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    ws.load(asset.url);
    wavesurferRef.current = ws;

    // Single cleanup function - destroy and nullify ref to help GC
    return () => {
      ws.destroy();
      wavesurferRef.current = null;
    };
  }, [asset?.url]);

  if (!asset) {
    return (
      <Stack
        onClick={onClick}
        alignItems="center"
        justifyContent="center"
        sx={{
          height,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'action.hover',
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'border-color 0.2s',
          '&:hover': isClickable ? { borderColor: 'primary.main' } : undefined,
        }}
      >
        <WaveformIcon size={48} weight="light" />
        <Typography variant="body2" color="text.secondary" mt={1}>
          {emptyText}
        </Typography>
      </Stack>
    );
  }

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    wavesurferRef.current?.playPause();
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        height,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: isClickable ? 'pointer' : 'default',
        p: 2,
      }}
    >
      <Stack direction="row" alignItems="center" gap={2} height="100%">
        <IconButton
          onClick={handlePlayPause}
          disabled={isLoading}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' },
            '&:disabled': { bgcolor: 'action.disabledBackground' },
          }}
        >
          {isPlaying ? <PauseIcon size={24} weight="fill" /> : <PlayIcon size={24} weight="fill" />}
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isLoading ? <LinearProgress /> : <Box ref={containerRef} sx={{ width: '100%' }} />}

          <Stack direction="row" justifyContent="space-between" mt={1}>
            <Typography variant="caption" color="text.secondary">
              {formatDuration(currentTime)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDuration(duration)}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};
