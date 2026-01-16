import { MimeTypes } from '@/database/types/Asset';

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
  ...new Set([...Object.values(EXTENSION_TO_MIME), MimeTypes.AudioWebm, MimeTypes.AudioMp4]),
];

export function getMimeTypeFromExtension(extension: string): string {
  return EXTENSION_TO_MIME[extension.toLowerCase()] || 'application/octet-stream';
}

export function isAllowedMimeType(mimeType: string): boolean {
  const baseMimeType = mimeType.split(';')[0];
  return ALLOWED_MIME_TYPES.includes(baseMimeType as MimeTypes);
}
