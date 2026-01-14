import { styled, Stack, Paper, ButtonBase } from '@mui/material';

export const HintContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.action.hover,
  borderRadius: theme.shape.borderRadius,
}));

export const HintHeader = styled(Stack)({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8,
});

export const HintButton = styled(ButtonBase)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  padding: theme.spacing(1, 2),
  borderRadius: theme.shape.borderRadius,
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-disabled': {
    opacity: 0.5,
  },
}));
