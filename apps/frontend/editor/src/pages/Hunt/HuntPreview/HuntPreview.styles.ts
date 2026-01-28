import styled from 'styled-components';
import { Stack } from '@mui/material';
import { PREVIEW_GAP, PREVIEW_STICKY_TOP, CONTROL_BAR_GAP } from '../layout.constants';

interface PreviewWrapperProps {
  $isOpen: boolean;
}

export const PreviewWrapper = styled(Stack)<PreviewWrapperProps>`
  position: sticky;
  top: ${PREVIEW_STICKY_TOP}px;
  align-self: flex-start;
  margin-top: ${({ theme }) => theme.spacing(4)};
  margin-right: 12px;
  flex-shrink: 0;
  gap: ${CONTROL_BAR_GAP}px;
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : `calc(100% + ${PREVIEW_GAP}px)`)});
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
  pointer-events: ${({ $isOpen }) => ($isOpen ? 'auto' : 'none')};
`;

export const Iframe = styled('iframe')`
  width: 100%;
  height: 100%;
  border: none;
`;
