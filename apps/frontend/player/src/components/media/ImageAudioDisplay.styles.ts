import styled, { keyframes, css } from 'styled-components';
import { Box, IconButton } from '@mui/material';
import { PlayIcon as PhosphorPlayIcon, PauseIcon as PhosphorPauseIcon, SpeakerHighIcon } from '@phosphor-icons/react';
import { alpha } from '@mui/material/styles';

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

export const Overlay = styled(Box)<{ $isPlaying: boolean }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $isPlaying }) => ($isPlaying ? 'transparent' : alpha('#000', 0.3))};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${alpha('#000', 0.4)};
  }
`;

export const PlayButton = styled(IconButton)<{ $isPlaying: boolean }>`
  width: 64px;
  height: 64px;
  background-color: ${({ theme }) => alpha(theme.palette.common.white, 0.9)};
  color: ${({ theme }) => theme.palette.primary.main};

  &:hover {
    background-color: ${({ theme }) => theme.palette.common.white};
  }

  ${({ $isPlaying }) =>
    $isPlaying &&
    css`
      opacity: 0;
      transition: opacity 0.2s ease;

      ${Overlay}:hover & {
        opacity: 1;
      }
    `}
`;

export const PlayIcon = styled(PhosphorPlayIcon).attrs({
  size: 32,
  weight: 'fill',
})``;

export const PauseIcon = styled(PhosphorPauseIcon).attrs({
  size: 32,
  weight: 'fill',
})``;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

export const SpeakerIndicator = styled(SpeakerHighIcon).attrs({
  size: 24,
  weight: 'fill',
})`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.palette.common.white};
  filter: drop-shadow(0 2px 4px ${alpha('#000', 0.3)});
  animation: ${pulse} 1s ease-in-out infinite;
`;
