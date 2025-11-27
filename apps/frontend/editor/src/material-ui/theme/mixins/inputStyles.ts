import { Theme } from '@mui/material';

export const getInputBaseStyles = (theme: Theme) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
  },
});

export const getInputFocusStyles = (theme: Theme) => ({
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
    borderWidth: 2,
  },
});

export const getInputErrorStyles = (theme: Theme) => ({
  '&.Mui-error .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.error.main,
  },
});

export const getInputHoverStyles = (theme: Theme) => ({
  '&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.action.hover,
  },
});

export const getInputOverrideStyles = (theme: Theme) => ({
  ...getInputBaseStyles(theme),
  ...getInputFocusStyles(theme),
  ...getInputErrorStyles(theme),
  ...getInputHoverStyles(theme),
});
