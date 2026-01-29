import styled from 'styled-components';
import { alpha } from '@mui/material/styles';
import { Stack, Box } from '@mui/material';

export const Container = styled(Stack)`
  flex: 1;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing(6)};
  padding-bottom: calc(${({ theme }) => theme.spacing(6)} + env(safe-area-inset-bottom));
  gap: ${({ theme }) => theme.spacing(3)};
  text-align: center;
`;

export const LogoWrap = styled(Box)`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const SparkleRing = styled(Box)`
  position: absolute;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  pointer-events: none;

  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: ${({ theme }) => alpha(theme.palette.accent.main, 0.7)};
    box-shadow:
      36px -42px 0 ${({ theme }) => alpha(theme.palette.accent.main, 0.5)},
      58px 10px 0 ${({ theme }) => alpha(theme.palette.accent.main, 0.6)},
      10px 58px 0 ${({ theme }) => alpha(theme.palette.accent.main, 0.5)},
      -42px 34px 0 ${({ theme }) => alpha(theme.palette.accent.main, 0.6)},
      -54px -18px 0 ${({ theme }) => alpha(theme.palette.accent.main, 0.55)};
  }

  &::after {
    width: 4px;
    height: 4px;
    background-color: ${({ theme }) => alpha(theme.palette.accent.main, 0.4)};
    box-shadow:
      52px -18px 0 ${({ theme }) => alpha(theme.palette.accent.main, 0.35)},
      26px 52px 0 ${({ theme }) => alpha(theme.palette.accent.main, 0.45)},
      -18px 54px 0 ${({ theme }) => alpha(theme.palette.accent.main, 0.4)},
      -52px 6px 0 ${({ theme }) => alpha(theme.palette.accent.main, 0.4)};
  }
`;

export const LogoCircle = styled(Box)`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.palette.primary.main};
  background-color: ${({ theme }) => alpha(theme.palette.primary.main, 0.08)};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

export const Logo = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
`;

export const SummaryCard = styled(Box)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(6)};
  border-radius: ${({ theme }) => theme.shape.md}px;
  background-color: ${({ theme }) => alpha(theme.palette.background.paper, 0.75)};
  border: 1px solid ${({ theme }) => alpha(theme.palette.divider, 0.6)};
  box-shadow: 0 8px 20px rgba(44, 24, 16, 0.08);
`;

export const Footer = styled(Stack)`
  width: 100%;
  margin-top: auto;
  gap: ${({ theme }) => theme.spacing(6)};
`;
