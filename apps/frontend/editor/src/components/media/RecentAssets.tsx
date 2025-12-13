import { Box, Typography, Stack, Skeleton } from '@mui/material';
import { ImageIcon, WaveformIcon, VideoIcon, CheckCircleIcon } from '@phosphor-icons/react';
import type { Asset } from '@hunthub/shared';

export interface RecentAssetsProps {
  assets: Asset[];
  selectedAssetId?: number | null;
  onAssetClick?: (asset: Asset) => void;
  onAssetDoubleClick?: (asset: Asset) => void;
  isLoading?: boolean;
  title?: string;
}

const THUMBNAIL_SIZE = 64;

const getAssetIcon = (mimeType: string) => {
  if (mimeType.startsWith('audio/')) {
    return <WaveformIcon size={24} weight="duotone" />;
  }
  if (mimeType.startsWith('video/')) {
    return <VideoIcon size={24} weight="duotone" />;
  }
  return <ImageIcon size={24} weight="duotone" />;
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

      <Stack
        direction="row"
        gap={1}
        sx={{
          overflowX: 'auto',
          pb: 1,
          '&::-webkit-scrollbar': { height: 4 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'divider',
            borderRadius: 2,
          },
        }}
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rounded"
                width={THUMBNAIL_SIZE}
                height={THUMBNAIL_SIZE}
                sx={{ flexShrink: 0 }}
              />
            ))
          : assets.map((asset) => (
              <RecentAssetItem
                key={asset.assetId}
                asset={asset}
                selected={asset.assetId === selectedAssetId}
                onClick={() => onAssetClick?.(asset)}
                onDoubleClick={() => onAssetDoubleClick?.(asset)}
              />
            ))}
      </Stack>
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
    <Box
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      sx={{
        width: THUMBNAIL_SIZE,
        height: THUMBNAIL_SIZE,
        flexShrink: 0,
        borderRadius: 1,
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative',
        border: '2px solid',
        borderColor: selected ? 'primary.main' : 'transparent',
        bgcolor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 0.2s',
        '&:hover': { borderColor: selected ? 'primary.main' : 'primary.light' },
      }}
    >
      {isImage ? (
        <Box
          component="img"
          src={asset.thumbnailUrl || asset.url}
          alt={asset.originalFilename || 'Asset'}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <Box sx={{ color: 'text.secondary' }}>{getAssetIcon(asset.mimeType)}</Box>
      )}

      {selected && (
        <Box
          sx={{
            position: 'absolute',
            top: 2,
            right: 2,
            color: 'primary.main',
            bgcolor: 'background.paper',
            borderRadius: '50%',
          }}
        >
          <CheckCircleIcon size={16} weight="fill" />
        </Box>
      )}
    </Box>
  );
};
