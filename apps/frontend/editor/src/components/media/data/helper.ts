import { MediaType } from '@hunthub/shared';
import type { Media, Asset, AssetSnapshot } from '@hunthub/shared';
import type { MediaFormData } from './types';
import { assertNever } from '@/utils';

export type SimpleAssetType = 'image' | 'audio' | 'video';

export const getPreviewType = (mediaType?: MediaType): SimpleAssetType => {
  switch (mediaType) {
    case MediaType.Audio:
      return 'audio';
    case MediaType.Video:
      return 'video';
    case MediaType.Image:
    case MediaType.ImageAudio:
    default:
      return 'image';
  }
};

export const typeToMediaType = (type: SimpleAssetType): MediaType => {
  switch (type) {
    case 'image':
      return MediaType.Image;
    case 'audio':
      return MediaType.Audio;
    case 'video':
      return MediaType.Video;
    default:
      return assertNever(type);
  }
};

export const MediaHelper = {
  assetToSnapshot: (asset: Asset): AssetSnapshot => ({
    id: asset.assetId,
    url: asset.url,
    name: asset.originalFilename || asset.url.split('/').pop() || 'Untitled',
    sizeBytes: asset.size || 0,
  }),

  hasData: (formData?: MediaFormData, type?: MediaType | null): boolean => {
    if (!formData || !type) {
      return false;
    }

    switch (type) {
      case MediaType.Image:
        return !!formData.image?.asset;
      case MediaType.Audio:
        return !!formData.audio?.asset;
      case MediaType.Video:
        return !!formData.video?.asset;
      case MediaType.ImageAudio:
        return !!formData.image?.asset && !!formData.audio?.asset;
      default:
        return false;
    }
  },

  isMediaValid: (media?: Media | null): boolean => {
    if (!media?.content || !media.type) {
      return false;
    }

    switch (media.type) {
      case MediaType.Image:
        return !!media.content.image?.asset?.url;
      case MediaType.Audio:
        return !!media.content.audio?.asset?.url;
      case MediaType.Video:
        return !!media.content.video?.asset?.url;
      case MediaType.ImageAudio:
        return !!media.content.imageAudio?.image?.asset?.url && !!media.content.imageAudio?.audio?.asset?.url;
      default:
        return false;
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
        return media.content.image?.title ?? undefined;
      case MediaType.Audio:
        return media.content.audio?.title ?? undefined;
      case MediaType.Video:
        return media.content.video?.title ?? undefined;
      case MediaType.ImageAudio:
        return media.content.imageAudio?.image?.title ?? undefined;
      default:
        return undefined;
    }
  },

  getDisplayName: (media?: Media | null): string | undefined => {
    const title = MediaHelper.getTitle(media);
    if (title) {
      return title;
    }

    const asset = MediaHelper.getPrimaryAsset(media);
    return asset?.name;
  },

  getAlt: (media?: Media | null): string | undefined => {
    if (!media?.content) {
      return undefined;
    }

    switch (media.type) {
      case MediaType.Image:
        return media.content.image?.alt ?? undefined;
      case MediaType.Video:
        return media.content.video?.alt ?? undefined;
      case MediaType.ImageAudio:
        return media.content.imageAudio?.image?.alt ?? undefined;
      default:
        return undefined;
    }
  },

  getTranscript: (media?: Media | null): string | undefined => {
    if (!media?.content) {
      return undefined;
    }

    switch (media.type) {
      case MediaType.Audio:
        return media.content.audio?.transcript ?? undefined;
      case MediaType.ImageAudio:
        return media.content.imageAudio?.audio?.transcript ?? undefined;
      default:
        return undefined;
    }
  },

  getUrl: (media?: Media | null): string | undefined => {
    const asset = MediaHelper.getPrimaryAsset(media);
    return asset?.url;
  },

  getSecondaryAsset: (media?: Media | null): AssetSnapshot | undefined => {
    if (!media?.content) {
      return undefined;
    }

    if (media.type === MediaType.ImageAudio) {
      return media.content.imageAudio?.audio?.asset;
    }

    return undefined;
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
