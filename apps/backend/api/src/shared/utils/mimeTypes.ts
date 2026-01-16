import { MimeTypes } from '@/database/types/Asset';

export const IMAGE_MIME_TYPES: ReadonlyArray<MimeTypes> = [
  MimeTypes.ImageJpeg,
  MimeTypes.ImagePng,
  MimeTypes.ImageWebp,
  MimeTypes.ImageGif,
];

export const AUDIO_MIME_TYPES: ReadonlyArray<MimeTypes> = [
  MimeTypes.AudioMpeg,
  MimeTypes.AudioWav,
  MimeTypes.AudioOgg,
  MimeTypes.AudioWebm,
  MimeTypes.AudioMp4,
];

export const VIDEO_MIME_TYPES: ReadonlyArray<MimeTypes> = [
  MimeTypes.VideoMp4,
  MimeTypes.VideoWebm,
];

export const EXTENSION_TO_MIME: Record<string, MimeTypes> = {
  jpg: MimeTypes.ImageJpeg,
  jpeg: MimeTypes.ImageJpeg,
  png: MimeTypes.ImagePng,
  webp: MimeTypes.ImageWebp,
  gif: MimeTypes.ImageGif,
  mp4: MimeTypes.VideoMp4,
  webm: MimeTypes.VideoWebm,
  mp3: MimeTypes.AudioMpeg,
  wav: MimeTypes.AudioWav,
  ogg: MimeTypes.AudioOgg,
  m4a: MimeTypes.AudioMp4,
};

export const ALLOWED_EXTENSIONS = Object.keys(EXTENSION_TO_MIME);

export const ALLOWED_MIME_TYPES: ReadonlyArray<MimeTypes> = [
  ...IMAGE_MIME_TYPES,
  ...AUDIO_MIME_TYPES,
  ...VIDEO_MIME_TYPES,
];

export function getMimeTypeFromExtension(extension: string): string {
  return EXTENSION_TO_MIME[extension.toLowerCase()] || 'application/octet-stream';
}

export function getBaseMimeType(mimeType: string): string {
  return mimeType.split(';')[0];
}

export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(getBaseMimeType(mimeType) as MimeTypes);
}
