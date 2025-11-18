import styled from 'styled-components';
import { Box, Typography, Button } from '@mui/material';
import noiseSvg from '@/assets/patterns/noise.svg';
import geometricSvg from '@/assets/patterns/geometric.svg';

export const HeroContainer = styled(Box)`
  position: relative;
  padding: 80px 24px;
  background: linear-gradient(135deg, #c17a3a 0%, #a8651f 40%, #8b4513 100%);
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
  padding: 0 24px;
  text-align: center;
`;

export const CompassCircle = styled(Box)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  margin-bottom: ${({ theme }) => theme.spacing(5)};
`;

export const HeroTitle = styled(Typography)`
  color: ${({ theme }) => theme.palette.common.white};
  font-family: 'Georgia', 'Cinzel', serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.02em;
  text-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export const HeroSubtitle = styled(Typography)`
  color: rgba(255, 255, 255, 0.95);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  margin-bottom: ${({ theme }) => theme.spacing(7)};
  max-width: 672px;
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
  background-color: rgba(255, 255, 255, 0.4);
`;

export const ButtonContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

export const PrimaryHeroButton = styled(Button)`
  background-color: ${({ theme }) => theme.palette.common.white};
  color: #b6591b;
  font-weight: 700;
  font-size: 15px;
  height: 48px;
  padding: 0 24px;
  border-radius: 12px;
  border: 3px solid #b6591b;
  box-shadow: 0 2px 6px rgba(139, 69, 19, 0.2);
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ theme }) => theme.palette.common.white};
    transform: scale(1.05) translateY(-2px);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const SecondaryHeroButton = styled(Button)`
  background-color: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.palette.common.white};
  font-weight: 600;
  font-size: 15px;
  height: 48px;
  padding: 0 24px;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 6px rgba(139, 69, 19, 0.2);
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
    transform: scale(1.05) translateY(-2px);
  }

  &:active {
    transform: scale(0.95);
  }
`;
