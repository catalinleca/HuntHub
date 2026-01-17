import { styled, Stack, Paper, ButtonBase } from '@mui/material';

export const HintContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  border: `1px dashed ${theme.palette.grey[300]}`,
  borderRadius: theme.shape.md,
}));

export const HintHeader = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

export const HintButton = styled(ButtonBase)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.md,
  backgroundColor: theme.palette.grey[50],
  border: `1px dashed ${theme.palette.grey[300]}`,
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
    borderColor: theme.palette.grey[400],
  },
  '&.Mui-disabled': {
    opacity: 0.5,
  },
}));
