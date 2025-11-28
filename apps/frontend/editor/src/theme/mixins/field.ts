import { Theme } from '@mui/material';
import { getFieldTokens } from '../tokens';

export const fieldMixins = {
  base: (theme: Theme) => {
    const tokens = getFieldTokens(theme);

    return {
      backgroundColor: tokens.base.background,
      borderRadius: tokens.borderRadius,
      color: tokens.base.text,
      transition: tokens.transition,
    };
  },

  border: (theme: Theme) => {
    const tokens = getFieldTokens(theme);

    return {
      borderColor: tokens.base.border,
      borderWidth: tokens.borderWidth.base,
      borderStyle: 'solid' as const,
    };
  },

  padding: (theme: Theme) => {
    const tokens = getFieldTokens(theme);

    return {
      padding: tokens.padding,
    };
  },

  hover: (theme: Theme) => {
    const tokens = getFieldTokens(theme);

    return {
      borderColor: tokens.hover.border,
    };
  },

  focus: (theme: Theme) => {
    const tokens = getFieldTokens(theme);

    return {
      borderColor: tokens.focus.border,
      borderWidth: tokens.borderWidth.focus,
      boxShadow: tokens.focus.shadow,
    };
  },

  error: (theme: Theme) => {
    const tokens = getFieldTokens(theme);

    return {
      borderColor: tokens.error.border,
      borderWidth: tokens.borderWidth.focus,
      boxShadow: tokens.error.shadow,
    };
  },

  disabled: (theme: Theme) => {
    const tokens = getFieldTokens(theme);

    return {
      backgroundColor: tokens.disabled.background,
      borderColor: tokens.disabled.border,
      color: tokens.disabled.text,
      cursor: 'not-allowed',
    };
  },

  a11yFocus: () => ({
    outline: '2px solid CanvasText',
    outlineOffset: '2px',
  }),
};

export type FieldMixins = typeof fieldMixins;
