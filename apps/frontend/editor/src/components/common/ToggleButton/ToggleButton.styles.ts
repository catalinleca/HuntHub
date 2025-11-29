import styled from 'styled-components';
import { ToggleButton as MuiToggleButton } from '@mui/material';
import { toggleButtonClasses } from '@mui/material/ToggleButton';
import { stateSelector } from '@/theme/selectors';

export const ToggleButton = styled(MuiToggleButton)<{ $color?: string }>(({ $color, theme }) => ({
  color: $color || theme.palette.text.secondary,

  [stateSelector(toggleButtonClasses.selected)]: {
    color: $color || theme.palette.text.secondary,
  },
}));
