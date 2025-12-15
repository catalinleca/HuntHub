import type { Asset } from '@hunthub/shared';
import { getAssetType } from '../data';
import { ImagePreview } from '../ImagePreview';
import { AudioPreview } from '../AudioPreview';
import { VideoPreview } from '../VideoPreview';

export interface AssetPreviewProps {
  asset: Asset;
  onClick?: () => void;
  height?: number | string;
}

export const AssetPreview = ({ asset, onClick, height }: AssetPreviewProps) => {
  const type = getAssetType(asset.mimeType);

  switch (type) {
    case 'audio':
      return <AudioPreview asset={asset} onClick={onClick} height={height} />;
    case 'video':
      return <VideoPreview asset={asset} onClick={onClick} height={height} />;
    default: {
      const imageUrl = asset.thumbnailUrl || asset.url;
      if (!imageUrl) {
        return null;
      }

      return (
        <ImagePreview
          asset={{ url: imageUrl, name: asset.originalFilename || 'Untitled' }}
          onClick={onClick}
          height={height}
        />
      );
    }
  }
};
