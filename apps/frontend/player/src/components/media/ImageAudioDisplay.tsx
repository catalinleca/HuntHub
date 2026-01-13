import { useState, useRef } from 'react';
import type { ImageAudioMedia } from '@hunthub/shared';
import * as S from './ImageAudioDisplay.styles';

interface ImageAudioDisplayProps {
  media: ImageAudioMedia;
}

export const ImageAudioDisplay = ({ media }: ImageAudioDisplayProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleTogglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const { image, audio } = media;

  return (
    <S.Container>
      <S.Image
        src={image.asset.url}
        alt={image.alt || image.title || 'Step image'}
      />
      <S.Overlay $isPlaying={isPlaying} onClick={handleTogglePlay}>
        <S.PlayButton $isPlaying={isPlaying}>
          {isPlaying ? <S.PauseIcon /> : <S.PlayIcon />}
        </S.PlayButton>
      </S.Overlay>
      {isPlaying && <S.SpeakerIndicator />}
      <audio
        ref={audioRef}
        src={audio.asset.url}
        preload="metadata"
        onEnded={handleAudioEnded}
      />
    </S.Container>
  );
};
