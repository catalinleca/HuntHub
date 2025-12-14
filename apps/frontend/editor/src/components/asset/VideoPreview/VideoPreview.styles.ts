import { styled } from '@mui/material/styles';
import { Stack, Box, IconButton as MuiIconButton } from '@mui/material';

// TODO - unify previews
export const EmptyState = styled(Stack, {
  shouldForwardProp: (prop) => prop !== '$clickable' && prop !== '$height',
})<{ $clickable?: boolean; $height?: number | string }>(({ theme, $clickable, $height }) => ({
  height: $height ?? 200,
  border: '2px dashed',
  borderColor: theme.palette.divider,
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: theme.palette.action.hover,
  cursor: $clickable ? 'pointer' : 'default',
  transition: 'border-color 0.2s',
  alignItems: 'center',
  justifyContent: 'center',
  ...($clickable && {
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
  }),
}));

export const Container = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$clickable' && prop !== '$height',
})<{ $clickable?: boolean; $height?: number | string }>(({ theme, $clickable, $height }) => ({
  height: $height ?? 200,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  cursor: $clickable ? 'pointer' : 'default',
  position: 'relative',
  backgroundColor: theme.palette.grey[900],
}));

export const Video = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
});

export const PlayButton = styled(MuiIconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
}));
