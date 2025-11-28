import { Theme } from '@mui/material';
import { getInputTokens } from '../../tokens';

export const getInputBaseStyles = (theme: Theme) => {
  const tokens = getInputTokens(theme);

  return {
    backgroundColor: tokens.base.background,
    borderRadius: tokens.borderRadius,

    '& .MuiOutlinedInput-input': {
      padding: tokens.padding,
    },

    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: tokens.base.border,
      borderWidth: tokens.borderWidth.base,
    },

    transition: tokens.transition,
  };
};

export const getInputHoverStyles = (theme: Theme) => {
  const tokens = getInputTokens(theme);

  return {
    '&:hover:not(.Mui-focused):not(.Mui-error):not(.Mui-disabled)': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: tokens.hover.border,
      },
    },
  };
};

export const getInputFocusStyles = (theme: Theme) => {
  const tokens = getInputTokens(theme);

  return {
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: tokens.focus.border,
        borderWidth: tokens.borderWidth.focus,
      },
      boxShadow: tokens.focus.shadow,
    },
  };
};

export const getInputErrorStyles = (theme: Theme) => {
  const tokens = getInputTokens(theme);

  return {
    '&.Mui-error': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: tokens.error.border,
        borderWidth: tokens.borderWidth.focus,
      },
      boxShadow: tokens.error.shadow,
    },
  };
};

export const getInputDisabledStyles = (theme: Theme) => {
  const tokens = getInputTokens(theme);

  return {
    '&.Mui-disabled': {
      backgroundColor: tokens.disabled.background,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: tokens.disabled.border,
      },
    },
  };
};

export const getInputA11yStyles = () => ({
  '@media (forced-colors: active)': {
    '&.Mui-focused': {
      outline: '2px solid CanvasText',
      outlineOffset: '2px',
    },
  },
});

export const getInputOverrideStyles = (theme: Theme) => ({
  ...getInputBaseStyles(theme),
  ...getInputHoverStyles(theme),
  ...getInputFocusStyles(theme),
  ...getInputErrorStyles(theme),
  ...getInputDisabledStyles(theme),
  ...getInputA11yStyles(),
});

export const getNativeInputStyles = (theme: Theme) => {
  const tokens = getInputTokens(theme);

  return {
    backgroundColor: tokens.base.background,
    borderRadius: tokens.borderRadius,
    padding: tokens.padding,
    border: `${tokens.borderWidth.base}px solid ${tokens.base.border}`,
    color: tokens.base.text,
    fontSize: 'inherit',
    fontFamily: 'inherit',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
    transition: tokens.transition,

    '&:hover:not(:focus):not(:disabled)': {
      borderColor: tokens.hover.border,
    },

    '&:focus': {
      borderColor: tokens.focus.border,
      borderWidth: tokens.borderWidth.focus,
      boxShadow: tokens.focus.shadow,
    },

    '&:disabled': {
      backgroundColor: tokens.disabled.background,
      borderColor: tokens.disabled.border,
      color: tokens.disabled.text,
      cursor: 'not-allowed',
    },

    '&[aria-invalid="true"], &[data-error="true"]': {
      borderColor: tokens.error.border,
      borderWidth: tokens.borderWidth.focus,
      boxShadow: tokens.error.shadow,
    },

    '@media (forced-colors: active)': {
      '&:focus': {
        outline: '2px solid CanvasText',
        outlineOffset: '2px',
      },
    },
  };
};