import { Theme } from '@mui/material';
import { outlinedInputClasses } from '@mui/material/OutlinedInput';
import { fieldMixins } from '../mixins';
import { getFieldTokens } from '../tokens';

const stateSelector = (className: string) => `&.${className}`;

const descendant = (className: string) => `& .${className}`;

const hoverExcludingStates = `&:hover:not(.${outlinedInputClasses.focused}):not(.${outlinedInputClasses.error}):not(.${outlinedInputClasses.disabled})`;

export const getMuiInputOverrideStyles = (theme: Theme) => {
  const tokens = getFieldTokens(theme);

  return {
    backgroundColor: tokens.base.background,
    borderRadius: tokens.borderRadius,
    transition: tokens.transition,

    [descendant(outlinedInputClasses.input)]: {
      padding: tokens.padding,
    },

    [descendant(outlinedInputClasses.notchedOutline)]: {
      borderColor: tokens.base.border,
      borderWidth: tokens.borderWidth.base,
    },

    // Hover state - only when NOT focused, error, or disabled
    [hoverExcludingStates]: {
      [descendant(outlinedInputClasses.notchedOutline)]: fieldMixins.hover(theme),
    },

    [stateSelector(outlinedInputClasses.focused)]: {
      [descendant(outlinedInputClasses.notchedOutline)]: {
        borderColor: tokens.focus.border,
        borderWidth: tokens.borderWidth.focus,
      },
      boxShadow: tokens.focus.shadow,
    },

    [stateSelector(outlinedInputClasses.error)]: {
      [descendant(outlinedInputClasses.notchedOutline)]: {
        borderColor: tokens.error.border,
        borderWidth: tokens.borderWidth.focus,
      },
      boxShadow: tokens.error.shadow,
    },

    [stateSelector(outlinedInputClasses.disabled)]: {
      backgroundColor: tokens.disabled.background,
      [descendant(outlinedInputClasses.notchedOutline)]: {
        borderColor: tokens.disabled.border,
      },
    },

    '@media (forced-colors: active)': {
      [stateSelector(outlinedInputClasses.focused)]: fieldMixins.a11yFocus(),
    },
  };
};

/**
 * Composable selectors - Individual helpers for custom compositions
 */
export const muiInputSelectors = {
  base: (theme: Theme) => {
    const tokens = getFieldTokens(theme);
    return {
      backgroundColor: tokens.base.background,
      borderRadius: tokens.borderRadius,
      transition: tokens.transition,
    };
  },

  inputPadding: (theme: Theme) => {
    const tokens = getFieldTokens(theme);
    return {
      [descendant(outlinedInputClasses.input)]: {
        padding: tokens.padding,
      },
    };
  },

  border: (theme: Theme) => {
    const tokens = getFieldTokens(theme);
    return {
      [descendant(outlinedInputClasses.notchedOutline)]: {
        borderColor: tokens.base.border,
        borderWidth: tokens.borderWidth.base,
      },
    };
  },

  hover: (theme: Theme) => ({
    [hoverExcludingStates]: {
      [descendant(outlinedInputClasses.notchedOutline)]: fieldMixins.hover(theme),
    },
  }),

  focus: (theme: Theme) => {
    const tokens = getFieldTokens(theme);
    return {
      [stateSelector(outlinedInputClasses.focused)]: {
        [descendant(outlinedInputClasses.notchedOutline)]: {
          borderColor: tokens.focus.border,
          borderWidth: tokens.borderWidth.focus,
        },
        boxShadow: tokens.focus.shadow,
      },
    };
  },

  error: (theme: Theme) => {
    const tokens = getFieldTokens(theme);
    return {
      [stateSelector(outlinedInputClasses.error)]: {
        [descendant(outlinedInputClasses.notchedOutline)]: {
          borderColor: tokens.error.border,
          borderWidth: tokens.borderWidth.focus,
        },
        boxShadow: tokens.error.shadow,
      },
    };
  },

  disabled: (theme: Theme) => {
    const tokens = getFieldTokens(theme);
    return {
      [stateSelector(outlinedInputClasses.disabled)]: {
        backgroundColor: tokens.disabled.background,
        [descendant(outlinedInputClasses.notchedOutline)]: {
          borderColor: tokens.disabled.border,
        },
      },
    };
  },

  a11y: () => ({
    '@media (forced-colors: active)': {
      [stateSelector(outlinedInputClasses.focused)]: fieldMixins.a11yFocus(),
    },
  }),
};

export { outlinedInputClasses };
