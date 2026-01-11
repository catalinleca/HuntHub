import styled from 'styled-components';
import { Stack } from '@mui/material';

export const Container = styled(Stack)`
  min-height: 100vh;
  background-color: ${({ theme }) => theme.palette.background.default};
`;
