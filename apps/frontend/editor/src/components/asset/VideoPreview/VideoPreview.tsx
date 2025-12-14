import { Typography } from '@mui/material';
import { VideoIcon, PlayIcon } from '@phosphor-icons/react';
import { useState, useRef } from 'react';
import * as S from './VideoPreview.styles';

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
      <S.EmptyState onClick={onClick} $clickable={isClickable} $height={height}>
        <VideoIcon size={48} weight="light" />
        <Typography variant="body2" color="text.secondary" mt={1}>
          {emptyText}
        </Typography>
      </S.EmptyState>
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
    <S.Container onClick={onClick} $clickable={isClickable} $height={height}>
      <S.Video ref={videoRef} src={asset.url} onEnded={() => setIsPlaying(false)} />
      {!isPlaying && (
        <S.PlayButton onClick={handlePlayClick}>
          <PlayIcon size={32} weight="fill" />
        </S.PlayButton>
      )}
    </S.Container>
  );
};
