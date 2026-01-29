import styled from 'styled-components';
import { Stack } from '@mui/material';

export const Container = styled(Stack)`
  flex: 1;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-top: max(
    ${({ theme }) => theme.spacing(6)},
    calc(${({ theme }) => theme.spacing(2)} + env(safe-area-inset-top, 0px))
  );
`;

export const Content = styled(Stack)`
  flex: 1;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;
