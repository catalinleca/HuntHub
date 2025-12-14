import { MediaType } from '@hunthub/shared';
import type { Media, AssetSnapshot, ImageMedia, AudioMedia, VideoMedia, ImageAudioMedia } from '@hunthub/shared';

const createEmptyAsset = (): AssetSnapshot => ({
  id: '',
  url: '',
  name: '',
  sizeBytes: 0,
});

const createEmptyImageContent = (): ImageMedia => ({
  asset: createEmptyAsset(),
  title: '',
  alt: '',
});

const createEmptyAudioContent = (): AudioMedia => ({
  asset: createEmptyAsset(),
  title: '',
  transcript: '',
});

const createEmptyVideoContent = (): VideoMedia => ({
  asset: createEmptyAsset(),
  title: '',
  alt: '',
});

const createEmptyImageAudioContent = (): ImageAudioMedia => ({
  image: createEmptyImageContent(),
  audio: createEmptyAudioContent(),
  title: '',
});

const createImageMedia = (): Media => ({
  type: MediaType.Image,
  content: {
    image: createEmptyImageContent(),
  },
});

const createAudioMedia = (): Media => ({
  type: MediaType.Audio,
  content: {
    audio: createEmptyAudioContent(),
  },
});

const createVideoMedia = (): Media => ({
  type: MediaType.Video,
  content: {
    video: createEmptyVideoContent(),
  },
});

const createImageAudioMedia = (): Media => ({
  type: MediaType.ImageAudio,
  content: {
    imageAudio: createEmptyImageAudioContent(),
  },
});

export const MediaGenerator = {
  createTemplate: (type: MediaType): Media => {
    switch (type) {
      case MediaType.Image:
        return createImageMedia();
      case MediaType.Audio:
        return createAudioMedia();
      case MediaType.Video:
        return createVideoMedia();
      case MediaType.ImageAudio:
        return createImageAudioMedia();
    }
  },
};
