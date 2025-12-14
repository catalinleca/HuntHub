import { MediaType } from '@hunthub/shared';
import type { Media, ImageMedia, AudioMedia, VideoMedia, AssetSnapshot } from '@hunthub/shared';
import type { MediaFormData, MediaImageFormData, MediaAudioFormData, MediaVideoFormData } from './types';
import { MediaGenerator } from './generator';

interface BaseMediaContent {
  asset: AssetSnapshot;
  title?: string;
}

interface BaseMediaFormData {
  asset: AssetSnapshot | null;
  title: string;
}

const fillBaseContent = (target: BaseMediaContent, source: BaseMediaFormData): void => {
  target.asset = source.asset!;
  target.title = source.title || undefined;
};

const fillImageContent = (target: ImageMedia, source: MediaImageFormData): void => {
  fillBaseContent(target, source);
  target.alt = source.alt || undefined;
};

const fillAudioContent = (target: AudioMedia, source: MediaAudioFormData): void => {
  fillBaseContent(target, source);
  target.transcript = source.transcript || undefined;
};

const fillVideoContent = (target: VideoMedia, source: MediaVideoFormData): void => {
  fillBaseContent(target, source);
  target.alt = source.alt || undefined;
};

const updateImageMedia = (formData: MediaFormData): Media => {
  const media = MediaGenerator.createTemplate(MediaType.Image);
  fillImageContent(media.content.image!, formData.image);
  return media;
};

const updateAudioMedia = (formData: MediaFormData): Media => {
  const media = MediaGenerator.createTemplate(MediaType.Audio);
  fillAudioContent(media.content.audio!, formData.audio);
  return media;
};

const updateVideoMedia = (formData: MediaFormData): Media => {
  const media = MediaGenerator.createTemplate(MediaType.Video);
  fillVideoContent(media.content.video!, formData.video);
  return media;
};

const updateImageAudioMedia = (formData: MediaFormData): Media => {
  const media = MediaGenerator.createTemplate(MediaType.ImageAudio);
  fillImageContent(media.content.imageAudio!.image, formData.image);
  fillAudioContent(media.content.imageAudio!.audio, formData.audio);
  return media;
};

export const MediaUpdater = {
  toMedia: (formData: MediaFormData, type: MediaType): Media => {
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
