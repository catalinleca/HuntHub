import styled, { keyframes } from 'styled-components';

const spinAnimation = keyframes`
  to { transform: rotate(360deg); }
`;

export type SpinnerSize = 'small' | 'medium' | 'large';

const sizeMap: Record<SpinnerSize, number> = {
  small: 14,
  medium: 18,
  large: 24,
};

const thicknessMap: Record<SpinnerSize, number> = {
  small: 2,
  medium: 2,
  large: 3,
};

interface StyledSpinnerProps {
  $size: SpinnerSize;
}

export const StyledSpinner = styled.span<StyledSpinnerProps>`
  display: inline-block;
  width: ${({ $size }) => sizeMap[$size]}px;
  height: ${({ $size }) => sizeMap[$size]}px;
  border: ${({ $size }) => thicknessMap[$size]}px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spinAnimation} 0.8s linear infinite;
`;
