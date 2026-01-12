import styled from 'styled-components';
import { Box } from '@mui/material';

export const Container = styled(Box)`
  position: sticky;
  top: 80px;
  align-self: flex-start;
  margin-top: ${({ theme }) => theme.spacing(4)};
  width: 320px;
  height: 580px;
  background-color: ${({ theme }) => theme.palette.background.surface};
  border: 2px solid ${({ theme }) => theme.palette.divider};
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
`;

export const Iframe = styled('iframe')`
  width: 100%;
  height: 100%;
  border: none;
`;
