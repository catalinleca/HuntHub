import { MediaType } from '@hunthub/shared';
import { ImagePreview } from './ImagePreview';
import { AudioPreview } from './AudioPreview';
import { VideoPreview } from './VideoPreview';

interface PreviewAsset {
  url: string;
  name?: string;
  originalFilename?: string;
  mimeType?: string;
}

export interface MediaPreviewProps {
  asset?: PreviewAsset | null;
  mediaType?: MediaType;
  onClick?: () => void;
  emptyText?: string;
  height?: number | string;
}

type PreviewType = 'image' | 'audio' | 'video';

export const MediaPreview = ({ asset, mediaType, onClick, emptyText, height }: MediaPreviewProps) => {
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

const getPreviewType = (asset?: PreviewAsset | null, explicitType?: MediaType): PreviewType => {
  if (explicitType) {
    switch (explicitType) {
      case MediaType.Audio:
        return 'audio';
      case MediaType.Video:
        return 'video';
      case MediaType.Image:
      case MediaType.ImageAudio:
      default:
        return 'image';
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
};
