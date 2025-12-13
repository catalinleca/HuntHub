import { Box, Typography, Stack } from '@mui/material';
import { ImageIcon } from '@phosphor-icons/react';
import type { Asset } from '@hunthub/shared';

export interface ImagePreviewProps {
  asset?: Asset | null;
  onClick?: () => void;
  emptyText?: string;
  height?: number | string;
}

export const ImagePreview = ({
  asset,
  onClick,
  emptyText = 'Click to select an image',
  height = 200,
}: ImagePreviewProps) => {
  const isClickable = !!onClick;

  if (!asset) {
    return (
      <Stack
        onClick={onClick}
        alignItems="center"
        justifyContent="center"
        sx={{
          height,
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'action.hover',
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'border-color 0.2s',
          '&:hover': isClickable ? { borderColor: 'primary.main' } : undefined,
        }}
      >
        <ImageIcon size={48} weight="light" />
        <Typography variant="body2" color="text.secondary" mt={1}>
          {emptyText}
        </Typography>
      </Stack>
    );
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        height,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: isClickable ? 'pointer' : 'default',
        position: 'relative',
        '&:hover': isClickable
          ? {
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0, 0, 0, 0.1)',
              },
            }
          : undefined,
      }}
    >
      <Box
        component="img"
        src={asset.url}
        alt={asset.originalFilename || 'Image preview'}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </Box>
  );
};
