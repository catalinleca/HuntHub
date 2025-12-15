import type { AssetSnapshot } from '@hunthub/shared';

export interface MediaImageFormData {
  asset: AssetSnapshot | null;
  title: string;
  alt: string;
}

export interface MediaAudioFormData {
  asset: AssetSnapshot | null;
  title: string;
  transcript: string;
}

export interface MediaVideoFormData {
  asset: AssetSnapshot | null;
  title: string;
  alt: string;
}

export interface MediaFormData {
  image: MediaImageFormData;
  audio: MediaAudioFormData;
  video: MediaVideoFormData;
}

export interface MediaDrawerForm {
  media: MediaFormData;
}
