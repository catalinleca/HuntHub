import Grid from '@mui/material/Grid2';
import { Typography } from '@mui/material';
import { FolderOpenIcon } from '@phosphor-icons/react';
import type { Asset } from '@hunthub/shared';
import { AssetCard } from './AssetCard';
import * as S from './AssetLibraryDrawer.styles';

export interface AssetGridProps {
  assets: Asset[];
  selectedAssetId?: number | null;
  onAssetClick?: (asset: Asset) => void;
  onAssetDoubleClick?: (asset: Asset) => void;
  emptyMessage?: string;
}

export const AssetGrid = ({
  assets,
  selectedAssetId,
  onAssetClick,
  onAssetDoubleClick,
  emptyMessage = 'No assets found',
}: AssetGridProps) => {
  if (assets.length === 0) {
    return (
      <S.EmptyState gap={1}>
        <FolderOpenIcon size={48} weight="light" aria-hidden="true" />
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </S.EmptyState>
    );
  }

  return (
    <Grid container spacing={2}>
      {assets.map((asset) => (
        <Grid size={6} key={asset.assetId}>
          <AssetCard
            asset={asset}
            selected={asset.assetId === selectedAssetId}
            onClick={() => onAssetClick?.(asset)}
            onDoubleClick={() => onAssetDoubleClick?.(asset)}
          />
        </Grid>
      ))}
    </Grid>
  );
};
