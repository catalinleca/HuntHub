import styled from 'styled-components';
import { Stack } from '@mui/material';

export const Container = styled(Stack)`
  flex: 1;
  min-height: 100%;
`;

export const Content = styled(Stack)`
  flex: 1;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(7)};
`;

export const CenteredContainer = styled(Stack)`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(3)};
`;
