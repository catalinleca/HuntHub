import styled from 'styled-components';
import { Box, Paper } from '@mui/material';

export const Container = styled(Paper)`
  padding: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const Content = styled(Box)`
  flex: 1;
`;

export const Footer = styled(Box)`
  margin-top: auto;
  padding-top: ${({ theme }) => theme.spacing(2)};
`;
