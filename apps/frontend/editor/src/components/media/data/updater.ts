import { MediaType } from '@hunthub/shared';
import type { Media, ImageMedia, AudioMedia, VideoMedia } from '@hunthub/shared';
import type { MediaFormData, MediaImageFormData, MediaAudioFormData, MediaVideoFormData } from './types';
import { MediaGenerator } from './generator';

const fillImageContent = (target: ImageMedia, source: MediaImageFormData): boolean => {
  if (!source.asset) {
    return false;
  }
  target.asset = source.asset;
  target.title = source.title || undefined;
  target.alt = source.alt || undefined;
  return true;
};

const fillAudioContent = (target: AudioMedia, source: MediaAudioFormData): boolean => {
  if (!source.asset) {
    return false;
  }
  target.asset = source.asset;
  target.title = source.title || undefined;
  target.transcript = source.transcript || undefined;
  return true;
};

const fillVideoContent = (target: VideoMedia, source: MediaVideoFormData): boolean => {
  if (!source.asset) {
    return false;
  }
  target.asset = source.asset;
  target.title = source.title || undefined;
  target.alt = source.alt || undefined;
  return true;
};

const updateImageMedia = (formData: MediaFormData): Media | null => {
  const media = MediaGenerator.createTemplate(MediaType.Image);
  if (!fillImageContent(media.content.image!, formData.image)) {
    return null;
  }
  return media;
};

const updateAudioMedia = (formData: MediaFormData): Media | null => {
  const media = MediaGenerator.createTemplate(MediaType.Audio);
  if (!fillAudioContent(media.content.audio!, formData.audio)) {
    return null;
  }
  return media;
};

const updateVideoMedia = (formData: MediaFormData): Media | null => {
  const media = MediaGenerator.createTemplate(MediaType.Video);
  if (!fillVideoContent(media.content.video!, formData.video)) {
    return null;
  }
  return media;
};

const updateImageAudioMedia = (formData: MediaFormData): Media | null => {
  const media = MediaGenerator.createTemplate(MediaType.ImageAudio);
  const imageOk = fillImageContent(media.content.imageAudio!.image, formData.image);
  const audioOk = fillAudioContent(media.content.imageAudio!.audio, formData.audio);
  if (!imageOk || !audioOk) {
    return null;
  }
  return media;
};

export const MediaUpdater = {
  toMedia: (formData: MediaFormData, type: MediaType): Media | null => {
    switch (type) {
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
