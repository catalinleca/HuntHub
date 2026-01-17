import { Stack } from '@mui/material';
import styled from 'styled-components';

export const Container = styled(Stack)`
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.palette.background.default};
`;

export const Content = styled(Stack)`
  align-items: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing(3)};
  max-width: 400px;
`;

export const IconWrapper = styled.div`
  color: ${({ theme }) => theme.palette.warning.main};
`;
