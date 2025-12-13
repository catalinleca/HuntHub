import { Box, Typography, Stack, IconButton } from '@mui/material';
import { VideoIcon, PlayIcon } from '@phosphor-icons/react';
import { useState, useRef } from 'react';

interface PreviewAsset {
  url: string;
}

export interface VideoPreviewProps {
  asset?: PreviewAsset | null;
  onClick?: () => void;
  emptyText?: string;
  height?: number | string;
}

export const VideoPreview = ({
  asset,
  onClick,
  emptyText = 'Click to select a video',
  height = 200,
}: VideoPreviewProps) => {
  const isClickable = !!onClick;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

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
        <VideoIcon size={48} weight="light" />
        <Typography variant="body2" color="text.secondary" mt={1}>
          {emptyText}
        </Typography>
      </Stack>
    );
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        height,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: isClickable ? 'pointer' : 'default',
        position: 'relative',
        bgcolor: 'grey.900',
      }}
    >
      <Box
        component="video"
        ref={videoRef}
        src={asset.url}
        onEnded={() => setIsPlaying(false)}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
      {!isPlaying && (
        <IconButton
          onClick={handlePlayClick}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'rgba(0, 0, 0, 0.6)',
            color: 'white',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
          }}
        >
          <PlayIcon size={32} weight="fill" />
        </IconButton>
      )}
    </Box>
  );
};
