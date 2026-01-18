import { styled } from '@mui/material/styles';
import { ListItemButton, Button } from '@mui/material';

interface StyledListItemProps {
  $isLive?: boolean;
}

export const ActionButton = styled(Button)`
  opacity: 0;
  transition: opacity 0.15s ease-in-out;
`;

export const VersionRow = styled(ListItemButton)<StyledListItemProps>(({ theme, $isLive }) => ({
  padding: theme.spacing(1, 2),
  borderLeft: $isLive ? `3px solid ${theme.palette.success.main}` : '3px solid transparent',
  backgroundColor: $isLive ? theme.palette.success.light + '20' : 'transparent',

  [`&:hover ${ActionButton}`]: {
    opacity: 1,
  },
}));
