import { styled } from '@mui/material/styles';
import { Drawer as MuiDrawer, Stack, Box } from '@mui/material';

const DRAWER_WIDTH = 400;
const DRAWER_Z_INDEX = 1200;

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
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(2),
}));

export const Footer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));
