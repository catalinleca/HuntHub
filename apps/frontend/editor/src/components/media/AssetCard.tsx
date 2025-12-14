import { Box, Typography, Stack, Card, CardActionArea } from '@mui/material';
import { ImageIcon, WaveformIcon, VideoIcon, CheckCircleIcon } from '@phosphor-icons/react';
import type { Asset } from '@hunthub/shared';

export interface AssetCardProps {
  asset: Asset;
  selected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getAssetIcon = (mimeType: string) => {
  if (mimeType.startsWith('audio/')) {
    return <WaveformIcon size={24} weight="duotone" />;
  }
  if (mimeType.startsWith('video/')) {
    return <VideoIcon size={24} weight="duotone" />;
  }
  return <ImageIcon size={24} weight="duotone" />;
};

export const AssetCard = ({ asset, selected = false, onClick, onDoubleClick }: AssetCardProps) => {
  const isImage = asset.mimeType.startsWith('image/');

  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        borderColor: selected ? 'primary.main' : 'divider',
        borderWidth: selected ? 2 : 1,
        transition: 'border-color 0.2s',
      }}
    >
      <CardActionArea onClick={onClick} onDoubleClick={onDoubleClick} sx={{ p: 1 }}>
        {/* Thumbnail */}
        <Box
          sx={{
            height: 100,
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
        </Box>

        {/* Filename & Size */}
        <Stack mt={1} gap={1}>
          <Typography variant="body2" noWrap title={asset.originalFilename || undefined} sx={{ fontWeight: 500 }}>
            {asset.originalFilename || `Asset ${asset.assetId}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(asset.size)}
          </Typography>
        </Stack>

        {/* Selection indicator */}
        {selected && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'primary.main',
              bgcolor: 'background.paper',
              borderRadius: '50%',
            }}
          >
            <CheckCircleIcon size={24} weight="fill" />
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
};
