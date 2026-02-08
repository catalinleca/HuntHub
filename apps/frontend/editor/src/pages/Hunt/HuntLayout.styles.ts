import styled from 'styled-components';
import { Stack, alpha } from '@mui/material';

export const Container = styled(Stack)`
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.palette.background.defaultLight};
`;

export const ContentArea = styled(Stack)`
  flex-direction: row;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(0, 3)};
  justify-content: center;
  overflow-x: clip;
  position: relative;

  ${({ theme }) => theme.breakpoints.down('lg')} {
    justify-content: flex-start;
  }

  ${({ theme }) => theme.breakpoints.down('md')} {
    padding: ${({ theme }) => theme.spacing(0, 2)};
  }
`;

export const ShowPreviewTab = styled.button`
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 48px;
  background: ${({ theme }) => alpha(theme.palette.background.surface, 0.9)};
  backdrop-filter: blur(8px);
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-right: none;
  border-radius: ${({ theme }) => theme.shape.sm}px 0 0 ${({ theme }) => theme.shape.sm}px;
  color: ${({ theme }) => theme.palette.text.secondary};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ theme }) => theme.shadows[2]};

  &:hover {
    background: ${({ theme }) => theme.palette.background.surface};
    color: ${({ theme }) => theme.palette.primary.main};
    width: 44px;
  }

  ${({ theme }) => theme.breakpoints.down('lg')} {
    display: none;
  }
`;
