import { MediaType } from '@hunthub/shared';
import type { AssetSnapshot } from '@hunthub/shared';
import { ImagePreview, AudioPreview, VideoPreview } from '@/components/asset';
import { getPreviewType } from './data';

export interface MediaPreviewProps {
  asset?: AssetSnapshot | null;
  mediaType?: MediaType;
  onClick?: () => void;
  emptyText?: string;
  height?: number | string;
}

export const MediaPreview = ({ asset, mediaType, onClick, emptyText, height }: MediaPreviewProps) => {
  const type = getPreviewType(mediaType);

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
