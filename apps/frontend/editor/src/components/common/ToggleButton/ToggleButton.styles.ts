import styled from 'styled-components';
import { ToggleButton as MuiToggleButton } from '@mui/material';
import { toggleButtonClasses } from '@mui/material/ToggleButton';
import { stateSelector } from '@/theme/selectors';
import { getColor } from '@/utils';
import type { PaletteColor } from '@/utils/getColor/types';

export const ToggleButton = styled(MuiToggleButton)<{ $color?: PaletteColor }>(({ $color, theme }) => {
  const color = $color ? getColor($color) : theme.palette.text.secondary;

  return {
    color,
    [stateSelector(toggleButtonClasses.selected)]: {
      color,
    },
  };
});
