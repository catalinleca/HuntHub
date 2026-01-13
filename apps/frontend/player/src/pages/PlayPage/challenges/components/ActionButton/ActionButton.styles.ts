import styled, { css, keyframes } from 'styled-components';
import { Button, alpha } from '@mui/material';

const pressAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(0.97); }
  100% { transform: scale(1); }
`;

const spinAnimation = keyframes`
  to { transform: rotate(360deg); }
`;

interface StyledButtonProps {
  $color?: string;
  $isLoading?: boolean;
}

export const StyledButton = styled(Button)<StyledButtonProps>`
  position: relative;
  min-height: 52px;
  border-radius: ${({ theme }) => theme.shape.md}px;
  font-size: 16px;
  font-weight: 600;
  text-transform: none;
  transition: all 0.2s ease;

  ${({ $color, theme }) => {
    const baseColor = $color || theme.palette.primary.main;
    return css`
      background: linear-gradient(135deg, ${baseColor} 0%, ${alpha(baseColor, 0.87)} 100%);
      box-shadow: 0 4px 12px ${alpha(baseColor, 0.25)};

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, ${alpha(baseColor, 0.93)} 0%, ${alpha(baseColor, 0.8)} 100%);
        box-shadow: 0 6px 16px ${alpha(baseColor, 0.31)};
        transform: translateY(-1px);
      }
    `;
  }}

  &:active:not(:disabled) {
    animation: ${pressAnimation} 0.15s ease-out;
  }

  &:disabled {
    background: ${({ theme }) => theme.palette.grey[300]};
    box-shadow: none;
    color: ${({ theme }) => theme.palette.grey[500]};
  }

  ${({ $isLoading }) =>
    $isLoading &&
    css`
      pointer-events: none;
      cursor: wait;
    `}
`;

export const ButtonContent = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const LoadingSpinner = styled.span`
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spinAnimation} 0.8s linear infinite;
`;
