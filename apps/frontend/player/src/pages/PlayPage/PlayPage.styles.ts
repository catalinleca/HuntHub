import styled from 'styled-components';
import { Stack } from '@mui/material';

export const Container = styled(Stack)`
  flex: 1;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const Content = styled(Stack)`
  flex: 1;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;
