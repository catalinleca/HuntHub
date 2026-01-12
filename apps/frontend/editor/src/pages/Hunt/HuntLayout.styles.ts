import styled from 'styled-components';
import { Stack } from '@mui/material';

export const Container = styled(Stack)`
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.palette.background.defaultLight};
`;

export const ContentArea = styled(Stack)`
  flex-direction: row;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(0, 3)};
  justify-content: center;
  overflow-x: clip;
`;
