export const FREE_TIER_HUNT_LIMIT = 2;
export const MAX_STEPS_PER_HUNT = 50;

export const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm',
  'audio/webm;codecs=opus': 'webm',
  'audio/mp4': 'm4a',
};

export const getExtensionFromMimeType = (mimeType: string): string => {
  const normalized = mimeType.trim().toLowerCase();
  const baseType = normalized.split(';')[0];

  return MIME_TO_EXTENSION[normalized] || MIME_TO_EXTENSION[baseType] || baseType.split('/')[1] || 'bin';
};
