import styled from 'styled-components';
import { Box } from '@mui/material';
import noiseSvg from '@/assets/patterns/noise.svg';
import geometricSvg from '@/assets/patterns/geometric.svg';

export const HeroContainer = styled(Box)`
  position: relative;
  min-height: 50vh;
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(10, 4)};
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
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
`;
