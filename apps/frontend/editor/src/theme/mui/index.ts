import { createTheme, Theme, ThemeOptions } from '@mui/material';
import { treasureMapPalette } from '../palettes';
import {
  getMuiButtonOverrides,
  getMuiCardOverrides,
  getMuiCheckboxOverrides,
  getMuiChipOverrides,
  getMuiCssBaselineOverrides,
  getMuiDialogOverrides,
  getMuiDialogActionsOverrides,
  getMuiDialogContentOverrides,
  getMuiDialogTitleOverrides,
  getMuiInputLabelOverrides,
  getMuiMenuOverrides,
  getMuiMenuItemOverrides,
  getMuiOutlinedInputOverrides,
  getMuiSelectOverrides,
  getMuiTextFieldOverrides,
  getMuiToggleButtonOverrides,
  getMuiToggleButtonGroupOverrides,
} from './overrides';

export const createAppTheme = (): Theme => {
  const options: ThemeOptions = {
    ...treasureMapPalette,
    components: {
      MuiButton: getMuiButtonOverrides(),
      MuiCard: getMuiCardOverrides(),
      MuiCheckbox: getMuiCheckboxOverrides(),
      MuiChip: getMuiChipOverrides(),
      MuiCssBaseline: getMuiCssBaselineOverrides(),
      MuiDialog: getMuiDialogOverrides(),
      MuiDialogActions: getMuiDialogActionsOverrides(),
      MuiDialogContent: getMuiDialogContentOverrides(),
      MuiDialogTitle: getMuiDialogTitleOverrides(),
      MuiInputLabel: getMuiInputLabelOverrides(),
      MuiMenu: getMuiMenuOverrides(),
      MuiMenuItem: getMuiMenuItemOverrides(),
      MuiOutlinedInput: getMuiOutlinedInputOverrides(),
      MuiSelect: getMuiSelectOverrides(),
      MuiTextField: getMuiTextFieldOverrides(),
      MuiToggleButton: getMuiToggleButtonOverrides(),
      MuiToggleButtonGroup: getMuiToggleButtonGroupOverrides(),
    },
  };

  return createTheme(options);
};

export const theme = createAppTheme();
