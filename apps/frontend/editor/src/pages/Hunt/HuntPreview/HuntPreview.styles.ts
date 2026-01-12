import styled from 'styled-components';
import { Box } from '@mui/material';

interface ContainerProps {
  $isOpen: boolean;
}

export const Container = styled(Box)<ContainerProps>`
  position: sticky;
  top: 150px;
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
  transform: translateX(${({ $isOpen }) => ($isOpen ? '0' : 'calc(100% + 24px)')});
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
