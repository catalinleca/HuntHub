import styled from 'styled-components';
import { Stack, Divider as MuiDivider, IconButton, alpha } from '@mui/material';

export const Wrapper = styled(Stack)`
  align-self: center;
`;

export const Container = styled(Stack)`
  background: ${({ theme }) => alpha(theme.palette.background.surface, 0.9)};
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: ${({ theme }) => theme.shape.md}px;
  box-shadow: ${({ theme }) => theme.shadows[2]};
  padding: 6px 8px;
`;

export const CloseButton = styled(IconButton)`
  color: ${({ theme }) => theme.palette.text.secondary};

  &:hover {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

export const ToggleGroup = styled(Stack)`
  border-radius: ${({ theme }) => theme.shape.sm}px;
  overflow: hidden;
`;

interface ToggleButtonProps {
  $isActive: boolean;
  $variant: 'success' | 'fail';
}

export const ToggleButton = styled.button<ToggleButtonProps>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.15s ease;

  &:first-child {
    border-radius: ${({ theme }) => theme.shape.sm}px 0 0 ${({ theme }) => theme.shape.sm}px;
    border-right: none;
  }

  &:last-child {
    border-radius: 0 ${({ theme }) => theme.shape.sm}px ${({ theme }) => theme.shape.sm}px 0;
  }

  ${({ $isActive, $variant, theme }) => {
    if (!$isActive) {
      return `
        background: transparent;
        color: ${theme.palette.text.secondary};

        &:hover {
          background: ${alpha(theme.palette.action.hover, 0.08)};
        }
      `;
    }

    const colors = {
      success: {
        bg: theme.palette.success.main,
        text: theme.palette.success.contrastText,
      },
      fail: {
        bg: theme.palette.error.main,
        text: theme.palette.error.contrastText,
      },
    };

    return `
      background: ${colors[$variant].bg};
      color: ${colors[$variant].text};
      border-color: ${colors[$variant].bg};
    `;
  }}
`;

export const Divider = styled(MuiDivider)`
  margin: 0 8px;
`;

export const ActionButtons = styled(Stack)`
  color: ${({ theme }) => theme.palette.text.secondary};
`;
