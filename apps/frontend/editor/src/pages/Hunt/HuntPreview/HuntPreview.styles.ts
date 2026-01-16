import styled from 'styled-components';
import { Box, Stack } from '@mui/material';
import { PREVIEW_WIDTH, PREVIEW_HEIGHT, PREVIEW_GAP, PREVIEW_STICKY_TOP } from '../layout.constants';

interface PreviewWrapperProps {
  $isOpen: boolean;
}

export const PreviewWrapper = styled(Stack)<PreviewWrapperProps>`
  position: sticky;
  top: ${PREVIEW_STICKY_TOP}px;
  align-self: flex-start;
  margin-top: ${({ theme }) => theme.spacing(4)};
  flex-shrink: 0;
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : `calc(100% + ${PREVIEW_GAP}px)`)});
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
`;

export const Container = styled(Box)`
  width: ${PREVIEW_WIDTH}px;
  height: ${PREVIEW_HEIGHT}px;
  background-color: ${({ theme }) => theme.palette.background.surface};
  border: 2px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.xl}px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows[8]};
`;

export const Iframe = styled('iframe')`
  width: 100%;
  height: 100%;
  border: none;
`;
