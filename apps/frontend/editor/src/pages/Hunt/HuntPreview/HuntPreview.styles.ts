import styled from 'styled-components';
import { Box } from '@mui/material';

export const Container = styled(Box)`
  flex: 1;
  display: flex;
  max-width: 400px;
  min-width: 320px;
  background-color: ${({ theme }) => theme.palette.background.surface};
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.md}px;
  overflow: hidden;
`;

export const Iframe = styled('iframe')`
  width: 100%;
  height: 100%;
  border: none;
`;