import { MediaType } from '@hunthub/shared';
import type { Media } from '@hunthub/shared';
import type { MediaFormData } from './types';

const updateImageMedia = (formData: MediaFormData): Media => ({
  type: MediaType.Image,
  content: {
    image: {
      asset: formData.image.asset!,
      title: formData.image.title || undefined,
      alt: formData.image.alt || undefined,
    },
  },
});

const updateAudioMedia = (formData: MediaFormData): Media => ({
  type: MediaType.Audio,
  content: {
    audio: {
      asset: formData.audio.asset!,
      title: formData.audio.title || undefined,
      transcript: formData.audio.transcript || undefined,
    },
  },
});

const updateVideoMedia = (formData: MediaFormData): Media => ({
  type: MediaType.Video,
  content: {
    video: {
      asset: formData.video.asset!,
      title: formData.video.title || undefined,
      alt: formData.video.alt || undefined,
    },
  },
});

const updateImageAudioMedia = (formData: MediaFormData): Media => ({
  type: MediaType.ImageAudio,
  content: {
    imageAudio: {
      image: {
        asset: formData.image.asset!,
        title: formData.image.title || undefined,
        alt: formData.image.alt || undefined,
      },
      audio: {
        asset: formData.audio.asset!,
        title: formData.audio.title || undefined,
        transcript: formData.audio.transcript || undefined,
      },
    },
  },
});

export const MediaUpdater = {
  toMedia: (formData: MediaFormData): Media => {
    switch (formData.type) {
      case MediaType.Image:
        return updateImageMedia(formData);
      case MediaType.Audio:
        return updateAudioMedia(formData);
      case MediaType.Video:
        return updateVideoMedia(formData);
      case MediaType.ImageAudio:
        return updateImageAudioMedia(formData);
    }
  },
};
