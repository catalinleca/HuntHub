import { Theme } from '@mui/material';
import { fieldMixins } from '../mixins';

// Native CSS selectors - extracted for readability
const HOVER = '&:hover:not(:focus):not(:disabled):not([aria-invalid="true"]):not([data-error="true"])';
const FOCUS = '&:focus';
const DISABLED = '&:disabled';
const ERROR = '&[aria-invalid="true"], &[data-error="true"]';
const HIGH_CONTRAST = '@media (forced-colors: active)';

export const getNativeFieldStyles = (theme: Theme) => ({
  ...fieldMixins.base(theme),
  ...fieldMixins.border(theme),
  ...fieldMixins.padding(theme),
  fontSize: 'inherit',
  fontFamily: 'inherit',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,

  [HOVER]: fieldMixins.hover(theme),
  [FOCUS]: fieldMixins.focus(theme),
  [DISABLED]: fieldMixins.disabled(theme),
  [ERROR]: fieldMixins.error(theme),

  [HIGH_CONTRAST]: {
    [FOCUS]: fieldMixins.a11yFocus(),
  },
});

export const nativeFieldSelectors = {
  base: (theme: Theme) => ({
    ...fieldMixins.base(theme),
    ...fieldMixins.border(theme),
    ...fieldMixins.padding(theme),
    outline: 'none',
    boxSizing: 'border-box' as const,
  }),
  hover: (theme: Theme) => ({ [HOVER]: fieldMixins.hover(theme) }),
  focus: (theme: Theme) => ({ [FOCUS]: fieldMixins.focus(theme) }),
  error: (theme: Theme) => ({ [ERROR]: fieldMixins.error(theme) }),
  disabled: (theme: Theme) => ({ [DISABLED]: fieldMixins.disabled(theme) }),
  a11y: () => ({ [HIGH_CONTRAST]: { [FOCUS]: fieldMixins.a11yFocus() } }),
};
