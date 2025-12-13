import { MediaType } from '@hunthub/shared';
import type { Media, Asset, AssetSnapshot } from '@hunthub/shared';
import type { MediaFormData } from './types';

export const MediaHelper = {
  assetToSnapshot: (asset: Asset): AssetSnapshot => ({
    id: asset.assetId.toString(),
    url: asset.url,
    name: asset.originalFilename || '',
    sizeBytes: asset.size || 0,
  }),

  canSave: (formData: MediaFormData): boolean => {
    switch (formData.type) {
      case MediaType.Image:
        return !!formData.image?.asset;
      case MediaType.Audio:
        return !!formData.audio?.asset;
      case MediaType.Video:
        return !!formData.video?.asset;
      case MediaType.ImageAudio:
        return !!formData.image?.asset && !!formData.audio?.asset;
    }
  },

  getTypeLabel: (type?: MediaType): string => {
    switch (type) {
      case MediaType.Image:
        return 'Image';
      case MediaType.Audio:
        return 'Audio';
      case MediaType.Video:
        return 'Video';
      case MediaType.ImageAudio:
        return 'Image + Audio';
      default:
        return 'Media';
    }
  },

  getTitle: (media?: Media | null): string | undefined => {
    if (!media?.content) {
      return undefined;
    }

    switch (media.type) {
      case MediaType.Image:
        return media.content.image?.title;
      case MediaType.Audio:
        return media.content.audio?.title;
      case MediaType.Video:
        return media.content.video?.title;
      case MediaType.ImageAudio:
        return media.content.imageAudio?.image?.title;
      default:
        return undefined;
    }
  },

  getPrimaryAsset: (media?: Media | null): AssetSnapshot | undefined => {
    if (!media?.content) {
      return undefined;
    }

    switch (media.type) {
      case MediaType.Image:
        return media.content.image?.asset;
      case MediaType.Audio:
        return media.content.audio?.asset;
      case MediaType.Video:
        return media.content.video?.asset;
      case MediaType.ImageAudio:
        return media.content.imageAudio?.image?.asset;
      default:
        return undefined;
    }
  },
};
