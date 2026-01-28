import styled from 'styled-components';
import { Box, Typography, Button, alpha } from '@mui/material';
import noiseSvg from '@/assets/patterns/noise.svg';
import geometricSvg from '@/assets/patterns/geometric.svg';

export const HeroContainer = styled(Box)`
  position: relative;
  padding: ${({ theme }) => theme.spacing(6)} ${({ theme }) => theme.spacing(6)};
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.palette.accent.light} 0%,
    ${({ theme }) => theme.palette.accent.medium} 40%,
    ${({ theme }) => theme.palette.secondary.main} 100%
  );
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url(${noiseSvg});
    opacity: 0.06;
    mix-blend-mode: multiply;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url(${geometricSvg});
    background-size: 60px 60px;
    opacity: 0.08;
    pointer-events: none;
  }
`;

export const HeroContent = styled(Box)`
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing(6)};
  text-align: center;
`;

export const CompassCircle = styled(Box)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: ${({ theme }) => alpha(theme.palette.common.white, 0.2)};
  backdrop-filter: blur(8px);
  box-shadow: ${({ theme }) => theme.shadows[7]};
  margin-bottom: ${({ theme }) => theme.spacing(5)};

  > img {
    filter: drop-shadow(${({ theme }) => theme.shadows[8]});
  }
`;

export const HeroTitle = styled(Typography)`
  color: ${({ theme }) => theme.palette.common.white};
  font-family: ${({ theme }) => theme.typography.displayFontFamily};
  text-shadow: ${({ theme }) => theme.shadows[7]};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export const HeroSubtitle = styled(Typography)`
  color: ${({ theme }) => alpha(theme.palette.common.white, 0.95)};
  text-shadow: ${({ theme }) => theme.shadows[4]};
  margin-bottom: ${({ theme }) => theme.spacing(7)};
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

export const DottedPath = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(7)};
`;

export const Dot = styled(Box)`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ theme }) => alpha(theme.palette.common.white, 0.4)};
`;

export const ButtonContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const PrimaryHeroButton = styled(Button)`
  background-color: ${({ theme }) => theme.palette.common.white};
  height: 48px;
  border: 3px solid ${({ theme }) => theme.palette.primary.main};
  box-shadow: ${({ theme }) => theme.shadows[4]};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.palette.common.white};
    transform: scale(1.05) translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows[4]};
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const SecondaryHeroButton = styled(Button)`
  background-color: ${({ theme }) => alpha(theme.palette.common.white, 0.1)};
  color: ${({ theme }) => theme.palette.common.white};
  height: 48px;
  border: 2px solid ${({ theme }) => alpha(theme.palette.common.white, 0.6)};
  box-shadow: ${({ theme }) => theme.shadows[2]};
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => alpha(theme.palette.common.white, 0.15)};
    transform: scale(1.05) translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows[4]};
  }

  &:active {
    transform: scale(0.95);
  }
`;
