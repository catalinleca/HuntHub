import { Grid, Typography, Stack } from '@mui/material';
import { FolderOpenIcon } from '@phosphor-icons/react';
import type { Asset } from '@hunthub/shared';
import { AssetCard } from './AssetCard';

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
      <Stack alignItems="center" justifyContent="center" py={6} gap={1}>
        <FolderOpenIcon size={48} weight="light" />
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Stack>
    );
  }

  return (
    <Grid container spacing={2}>
      {assets.map((asset) => (
        <Grid item xs={6} key={asset.assetId}>
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
