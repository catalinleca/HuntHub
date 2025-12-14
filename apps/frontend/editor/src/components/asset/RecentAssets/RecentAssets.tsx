import { Box, Typography } from '@mui/material';
import { ImageIcon, WaveformIcon, VideoIcon, CheckCircleIcon } from '@phosphor-icons/react';
import type { Asset } from '@hunthub/shared';
import { getAssetType } from '../data';
import * as S from './RecentAssets.styles';

export interface RecentAssetsProps {
  assets: Asset[];
  selectedAssetId?: number | null;
  onAssetClick?: (asset: Asset) => void;
  onAssetDoubleClick?: (asset: Asset) => void;
  isLoading?: boolean;
  title?: string;
}

const getAssetIcon = (mimeType: string) => {
  const type = getAssetType(mimeType);
  switch (type) {
    case 'audio':
      return <WaveformIcon size={24} weight="duotone" />;
    case 'video':
      return <VideoIcon size={24} weight="duotone" />;
    default:
      return <ImageIcon size={24} weight="duotone" />;
  }
};

export const RecentAssets = ({
  assets,
  selectedAssetId,
  onAssetClick,
  onAssetDoubleClick,
  isLoading = false,
  title = 'Recent',
}: RecentAssetsProps) => {
  if (!isLoading && assets.length === 0) {
    return null;
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" mb={1}>
        {title}
      </Typography>

      <S.ScrollContainer gap={1}>
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <S.ThumbnailSkeleton key={i} variant="rounded" />)
          : assets.map((asset) => (
              <RecentAssetItem
                key={asset.assetId}
                asset={asset}
                selected={asset.assetId === selectedAssetId}
                onClick={() => onAssetClick?.(asset)}
                onDoubleClick={() => onAssetDoubleClick?.(asset)}
              />
            ))}
      </S.ScrollContainer>
    </Box>
  );
};

interface RecentAssetItemProps {
  asset: Asset;
  selected: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
}

const RecentAssetItem = ({ asset, selected, onClick, onDoubleClick }: RecentAssetItemProps) => {
  const isImage = asset.mimeType.startsWith('image/');

  return (
    <S.ThumbnailItem onClick={onClick} onDoubleClick={onDoubleClick} $selected={selected}>
      {isImage ? (
        <S.ThumbnailImage src={asset.thumbnailUrl || asset.url} alt={asset.originalFilename || 'Asset'} />
      ) : (
        <S.IconContainer>{getAssetIcon(asset.mimeType)}</S.IconContainer>
      )}

      {selected && (
        <S.SelectionIndicator>
          <CheckCircleIcon size={16} weight="fill" />
        </S.SelectionIndicator>
      )}
    </S.ThumbnailItem>
  );
};
