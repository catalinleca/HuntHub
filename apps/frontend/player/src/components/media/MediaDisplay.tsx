import type { ReactNode } from 'react';
import type { Media, MediaContent, MediaType } from '@hunthub/shared';
import { ImageDisplay } from './ImageDisplay';
import { AudioPlayer } from './AudioPlayer';
import { VideoPlayer } from './VideoPlayer';
import { ImageAudioDisplay } from './ImageAudioDisplay';

const renderers: Record<MediaType, (c: MediaContent) => ReactNode> = {
  image: (c) => c.image && <ImageDisplay image={c.image} />,
  audio: (c) => c.audio && <AudioPlayer audio={c.audio} />,
  video: (c) => c.video && <VideoPlayer video={c.video} />,
  'image-audio': (c) => c.imageAudio && <ImageAudioDisplay media={c.imageAudio} />,
};

interface MediaDisplayProps {
  media: Media;
}

export const MediaDisplay = ({ media }: MediaDisplayProps) => {
  return renderers[media.type]?.(media.content) ?? null;
};