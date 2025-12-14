import { styled } from '@mui/material/styles';
import { Stack, Box, Skeleton as MuiSkeleton } from '@mui/material';

const THUMBNAIL_SIZE = 64;

export const ScrollContainer = styled(Stack)({
  flexDirection: 'row',
  overflowX: 'auto',
  paddingBottom: 8,
  '&::-webkit-scrollbar': {
    height: 4,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'var(--mui-palette-divider)',
    borderRadius: 2,
  },
});

export const ThumbnailSkeleton = styled(MuiSkeleton)({
  width: THUMBNAIL_SIZE,
  height: THUMBNAIL_SIZE,
  flexShrink: 0,
});

export const ThumbnailItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$selected',
})<{ $selected?: boolean }>(({ theme, $selected }) => ({
  width: THUMBNAIL_SIZE,
  height: THUMBNAIL_SIZE,
  flexShrink: 0,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  cursor: 'pointer',
  position: 'relative',
  border: '2px solid',
  borderColor: $selected ? theme.palette.primary.main : 'transparent',
  backgroundColor: theme.palette.action.hover,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'border-color 0.2s',
  '&:hover': {
    borderColor: $selected ? theme.palette.primary.main : theme.palette.primary.light,
  },
}));

export const ThumbnailImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

export const IconContainer = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

export const SelectionIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 2,
  right: 2,
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper,
  borderRadius: '50%',
}));
