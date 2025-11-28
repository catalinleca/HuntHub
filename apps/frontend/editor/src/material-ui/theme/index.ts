import { createTheme, Theme, ThemeOptions } from '@mui/material';
import treasureMapPalette from '../palettes/treasure-map';
import {
  getMuiButtonOverrides,
  getMuiCardOverrides,
  getMuiChipOverrides,
  getMuiDialogOverrides,
  getMuiDialogActionsOverrides,
  getMuiDialogContentOverrides,
  getMuiDialogTitleOverrides,
  getMuiInputLabelOverrides,
  getMuiSelectOverrides,
  getMuiTextFieldOverrides,
  getMuiTypographyOverrides,
} from './overrides';

export const createAppTheme = (): Theme => {
  const options: ThemeOptions = {
    ...treasureMapPalette,
    components: {
      MuiButton: getMuiButtonOverrides(),
      MuiCard: getMuiCardOverrides(),
      MuiChip: getMuiChipOverrides(),
      MuiDialog: getMuiDialogOverrides(),
      MuiDialogActions: getMuiDialogActionsOverrides(),
      MuiDialogContent: getMuiDialogContentOverrides(),
      MuiDialogTitle: getMuiDialogTitleOverrides(),
      MuiInputLabel: getMuiInputLabelOverrides(),
      MuiSelect: getMuiSelectOverrides(),
      MuiTextField: getMuiTextFieldOverrides(),
      MuiTypography: getMuiTypographyOverrides(),
    },
  };

  return createTheme(options);
};

export const theme = createAppTheme();
