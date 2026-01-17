import { styled, Stack, Paper, ButtonBase, alpha } from '@mui/material';

export const HintContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: alpha(theme.palette.accent.main, 0.08),
  border: `1px solid ${alpha(theme.palette.accent.main, 0.2)}`,
  borderRadius: theme.shape.md,
}));

export const HintHeader = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  color: theme.palette.accent.dark,
}));

export const HintButton = styled(ButtonBase)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.md,
  backgroundColor: alpha(theme.palette.accent.main, 0.1),
  border: `1px solid ${alpha(theme.palette.accent.main, 0.2)}`,
  color: theme.palette.accent.dark,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.accent.main, 0.15),
    borderColor: alpha(theme.palette.accent.main, 0.3),
  },
  '&.Mui-disabled': {
    opacity: 0.5,
  },
}));
