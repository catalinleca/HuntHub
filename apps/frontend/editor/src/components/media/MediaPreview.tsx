import { MediaType } from '@hunthub/shared';
import type { Asset } from '@hunthub/shared';
import { ImagePreview } from './ImagePreview';
import { AudioPreview } from './AudioPreview';
import { VideoPreview } from './VideoPreview';

export interface MediaPreviewProps {
  asset?: Asset | null;
  mediaType?: MediaType;
  onClick?: () => void;
  emptyText?: string;
  height?: number | string;
}

type PreviewType = 'image' | 'audio' | 'video';

/**
 * Routes to the correct preview component based on asset mimeType or explicit mediaType
 */
export const MediaPreview = ({ asset, mediaType, onClick, emptyText, height }: MediaPreviewProps) => {
  // Determine type from asset mimeType or explicit mediaType prop
  const type = getPreviewType(asset, mediaType);

  switch (type) {
    case 'audio':
      return <AudioPreview asset={asset} onClick={onClick} emptyText={emptyText} height={height} />;
    case 'video':
      return <VideoPreview asset={asset} onClick={onClick} emptyText={emptyText} height={height} />;
    case 'image':
    default:
      return <ImagePreview asset={asset} onClick={onClick} emptyText={emptyText} height={height} />;
  }
};

function getPreviewType(asset?: Asset | null, explicitType?: MediaType): PreviewType {
  if (explicitType) {
    switch (explicitType) {
      case MediaType.Audio:
        return 'audio';
      case MediaType.Video:
        return 'video';
      case MediaType.Image:
      case MediaType.ImageAudio:
      default:
        return 'image'; // For image-audio, default to showing image
    }
  }

  if (!asset?.mimeType) {
    return 'image';
  }

  if (asset.mimeType.startsWith('audio/')) {
    return 'audio';
  }
  if (asset.mimeType.startsWith('video/')) {
    return 'video';
  }
  return 'image';
}
