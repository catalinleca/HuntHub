import styled from 'styled-components';
import { Stack } from '@mui/material';

export const Container = styled(Stack)`
  min-height: 100vh;
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  background-color: ${({ theme }) => theme.palette.background.default};
`;
