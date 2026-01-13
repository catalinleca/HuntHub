import styled from 'styled-components';
import { Paper } from '@mui/material';

export const Container = styled(Paper)`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.shape.md}px;
`;
