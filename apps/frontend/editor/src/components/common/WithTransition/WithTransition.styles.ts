import { Box } from '@mui/material';
import styled, { css } from 'styled-components';
import type { TransitionVariant } from './WithTransition';

const assertUnreachable = (x: never): never => {
  throw new Error(`Unhandled TransitionVariant: ${x}`);
};

interface TransitionWrapperProps {
  $variant: TransitionVariant;
  $duration: number;
}

const getEnterStyles = (variant: TransitionVariant) => {
  switch (variant) {
    case 'fade':
      return css`
        opacity: 0;
      `;
    case 'fade-slide-down':
      return css`
        opacity: 0;
        transform: translateY(-8px);
      `;
    case 'fade-slide-up':
      return css`
        opacity: 0;
        transform: translateY(8px);
      `;
    case 'fade-scale':
      return css`
        opacity: 0;
        transform: scale(0.95);
      `;
    case 'slide-left':
      return css`
        opacity: 0;
        transform: translateX(16px);
      `;
    default:
      return assertUnreachable(variant);
  }
};

const getExitStyles = (variant: TransitionVariant) => {
  switch (variant) {
    case 'fade':
      return css`
        opacity: 0;
      `;
    case 'fade-slide-down':
      return css`
        opacity: 0;
        transform: translateY(8px);
      `;
    case 'fade-slide-up':
      return css`
        opacity: 0;
        transform: translateY(-8px);
      `;
    case 'fade-scale':
      return css`
        opacity: 0;
        transform: scale(0.95);
      `;
    case 'slide-left':
      return css`
        opacity: 0;
        transform: translateX(-16px);
      `;
    default:
      return assertUnreachable(variant);
  }
};

export const TransitionWrapper = styled(Box)<TransitionWrapperProps>`
  &.enter {
    ${({ $variant }) => getEnterStyles($variant)}
  }

  &.enter-active {
    opacity: 1;
    transform: translateY(0) translateX(0) scale(1);
    transition:
      opacity ${({ $duration }) => $duration}ms ease,
      transform ${({ $duration }) => $duration}ms ease;
  }

  &.exit {
    opacity: 1;
    transform: translateY(0) translateX(0) scale(1);
  }

  &.exit-active {
    ${({ $variant }) => getExitStyles($variant)}
    transition:
      opacity ${({ $duration }) => $duration}ms ease,
      transform ${({ $duration }) => $duration}ms ease;
  }
`;
