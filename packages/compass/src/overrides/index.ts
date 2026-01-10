import type { Components, Theme } from '@mui/material/styles';

export { getMuiButtonOverrides } from './MuiButton';
export { getMuiCardOverrides } from './MuiCard';
export { getMuiCheckboxOverrides } from './MuiCheckbox';
export { getMuiChipOverrides } from './MuiChip';
export { getMuiCssBaselineOverrides } from './MuiCssBaseline';
export { getMuiDialogOverrides } from './MuiDialog';
export { getMuiDialogActionsOverrides } from './MuiDialogActions';
export { getMuiDialogContentOverrides } from './MuiDialogContent';
export { getMuiDialogTitleOverrides } from './MuiDialogTitle';
export { getMuiInputLabelOverrides } from './MuiInputLabel';
export { getMuiMenuOverrides } from './MuiMenu';
export { getMuiMenuItemOverrides } from './MuiMenuItem';
export { getMuiOutlinedInputOverrides } from './MuiOutlinedInput';
export { getMuiSelectOverrides } from './MuiSelect';
export { getMuiTextFieldOverrides } from './MuiTextField';
export { getMuiToggleButtonOverrides } from './MuiToggleButton';
export { getMuiToggleButtonGroupOverrides } from './MuiToggleButtonGroup';

import { getMuiButtonOverrides } from './MuiButton';
import { getMuiCardOverrides } from './MuiCard';
import { getMuiCheckboxOverrides } from './MuiCheckbox';
import { getMuiChipOverrides } from './MuiChip';
import { getMuiCssBaselineOverrides } from './MuiCssBaseline';
import { getMuiDialogOverrides } from './MuiDialog';
import { getMuiDialogActionsOverrides } from './MuiDialogActions';
import { getMuiDialogContentOverrides } from './MuiDialogContent';
import { getMuiDialogTitleOverrides } from './MuiDialogTitle';
import { getMuiInputLabelOverrides } from './MuiInputLabel';
import { getMuiMenuOverrides } from './MuiMenu';
import { getMuiMenuItemOverrides } from './MuiMenuItem';
import { getMuiOutlinedInputOverrides } from './MuiOutlinedInput';
import { getMuiSelectOverrides } from './MuiSelect';
import { getMuiTextFieldOverrides } from './MuiTextField';
import { getMuiToggleButtonOverrides } from './MuiToggleButton';
import { getMuiToggleButtonGroupOverrides } from './MuiToggleButtonGroup';

export const getAllOverrides = (): Components<Theme> => ({
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
});
