import { MimeTypes } from '@/database/types/Asset';

export const EXTENSION_TO_MIME: Record<string, MimeTypes> = {
  jpg: MimeTypes.ImageJpeg,
  jpeg: MimeTypes.ImageJpeg,
  png: MimeTypes.ImagePng,
  webp: MimeTypes.ImageWebp,
  gif: MimeTypes.ImageGif,
  mp4: MimeTypes.VideoMp4,
  webm: MimeTypes.VideoWebm,
  mp3: MimeTypes.AudioMp3,
  wav: MimeTypes.AudioWav,
  ogg: MimeTypes.AudioOgg,
};

export const ALLOWED_EXTENSIONS = Object.keys(EXTENSION_TO_MIME);

export const ALLOWED_MIME_TYPES: ReadonlyArray<MimeTypes> = Object.values(EXTENSION_TO_MIME);

export function getMimeTypeFromExtension(extension: string): string {
  return EXTENSION_TO_MIME[extension.toLowerCase()] || 'application/octet-stream';
}
