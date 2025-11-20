import styled from 'styled-components';
import { Stack } from '@mui/material';

export const HuntCardBody = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  padding: theme.spacing(3),
  gap: theme.spacing(2),
}));
