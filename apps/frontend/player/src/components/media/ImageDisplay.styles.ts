import styled from 'styled-components';
import { Box } from '@mui/material';

export const Container = styled(Box)`
  position: relative;
  width: 100%;
  border-radius: ${({ theme }) => theme.shape.md}px;
  overflow: hidden;
`;

export const Image = styled.img`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 280px;
`;
