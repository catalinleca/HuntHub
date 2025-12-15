import { styled } from '@mui/material/styles';
import { Drawer as MuiDrawer, Stack, Box, Card as MuiCard } from '@mui/material';

const DRAWER_WIDTH = 400;
const DRAWER_Z_INDEX = 1201; // Above MediaDetailsDrawer (1200)

export const Drawer = styled(MuiDrawer)({
  zIndex: DRAWER_Z_INDEX,
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    boxSizing: 'border-box',
  },
});

export const Container = styled(Stack)({
  height: '100%',
});

export const Header = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const Title = styled('span')({
  flex: 1,
});

export const SearchContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(1),
}));

export const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
  paddingTop: theme.spacing(1),
}));

export const LoadingContainer = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

export const Footer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export const Card = styled(MuiCard, {
  shouldForwardProp: (prop) => prop !== '$selected',
})<{ $selected?: boolean }>(({ theme, $selected }) => ({
  position: 'relative',
  borderColor: $selected ? theme.palette.primary.main : theme.palette.divider,
  borderWidth: $selected ? 2 : 1,
  transition: 'border-color 0.2s',
}));

export const PreviewWrapper = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
}));

export const SelectionIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper,
  borderRadius: '50%',
}));

export const EmptyState = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
}));
