import { styled } from '@mui/material/styles';
import { Stack, Box, IconButton as MuiIconButton } from '@mui/material';

export const EmptyState = styled(Stack, {
  shouldForwardProp: (prop) => prop !== '$clickable' && prop !== '$height',
})<{ $clickable?: boolean; $height?: number | string }>(({ theme, $clickable, $height }) => ({
  height: $height ?? 120,
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
  height: $height ?? 120,
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  cursor: $clickable ? 'pointer' : 'default',
  padding: theme.spacing(2),
}));

export const PlayButton = styled(MuiIconButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
  },
}));

export const WaveformContainer = styled(Box)({
  flex: 1,
  minWidth: 0,
});
