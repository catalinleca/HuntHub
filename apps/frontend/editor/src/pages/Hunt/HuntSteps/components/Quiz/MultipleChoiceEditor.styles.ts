import { Button } from '@mui/material';
import styled from 'styled-components';

export const AddButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  color: theme.palette.text.secondary,
  borderRadius: theme.shape.md,
  padding: theme.spacing(1.5, 2),
  justifyContent: 'flex-start',
  textTransform: 'none',
  fontWeight: 500,

  '&:hover': {
    backgroundColor: theme.palette.grey[200],
  },

  '&.Mui-disabled': {
    backgroundColor: theme.palette.grey[50],
    color: theme.palette.grey[400],
  },
}));
