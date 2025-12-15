import { styled } from '@mui/material/styles';
import { Stack, Box } from '@mui/material';

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

export const ImageContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$clickable' && prop !== '$height',
})<{ $clickable?: boolean; $height?: number | string }>(({ theme, $clickable, $height }) => ({
  height: $height ?? 200,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  cursor: $clickable ? 'pointer' : 'default',
  position: 'relative',
  ...($clickable && {
    '&:hover::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
  }),
}));

export const Image = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});
