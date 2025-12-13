import { MediaType } from '@hunthub/shared';
import type { Media } from '@hunthub/shared';
import type { MediaFormData, MediaImageFormData, MediaAudioFormData, MediaVideoFormData } from './types';

const parseImageMedia = (media?: Media | null): MediaImageFormData => {
  const image = media?.content?.image ?? media?.content?.imageAudio?.image;
  return {
    asset: image?.asset ?? null,
    title: image?.title ?? '',
    alt: image?.alt ?? '',
  };
};

const parseAudioMedia = (media?: Media | null): MediaAudioFormData => {
  const audio = media?.content?.audio ?? media?.content?.imageAudio?.audio;
  return {
    asset: audio?.asset ?? null,
    title: audio?.title ?? '',
    transcript: audio?.transcript ?? '',
  };
};

const parseVideoMedia = (media?: Media | null): MediaVideoFormData => {
  const video = media?.content?.video;
  return {
    asset: video?.asset ?? null,
    title: video?.title ?? '',
    alt: video?.alt ?? '',
  };
};

export const MediaParser = {
  toFormData: (media?: Media | null): MediaFormData => ({
    type: media?.type ?? MediaType.Image,
    image: parseImageMedia(media),
    audio: parseAudioMedia(media),
    video: parseVideoMedia(media),
  }),
};
