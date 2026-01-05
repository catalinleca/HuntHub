import styled from 'styled-components';
import { ToggleButton as MuiToggleButton } from '@mui/material';
import { toggleButtonClasses } from '@mui/material/ToggleButton';
import { stateSelector, getColor } from '@hunthub/compass';
import type { PaletteColor } from '@hunthub/compass';

export const ToggleButton = styled(MuiToggleButton)<{ $color?: PaletteColor }>(({ $color, theme }) => {
  const color = $color ? getColor($color) : theme.palette.text.secondary;

  return {
    color,
    [stateSelector(toggleButtonClasses.selected)]: {
      color,
    },
  };
});
