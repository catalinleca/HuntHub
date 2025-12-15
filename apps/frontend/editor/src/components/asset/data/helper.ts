export { prettyBytes } from '@/utils';

export type AssetType = 'image' | 'audio' | 'video';

export const getAssetType = (mimeType: string): AssetType => {
  if (mimeType.startsWith('audio/')) {
    return 'audio';
  }

  if (mimeType.startsWith('video/')) {
    return 'video';
  }

  return 'image';
};
