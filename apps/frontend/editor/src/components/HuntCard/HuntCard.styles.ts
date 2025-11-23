import styled from 'styled-components';
import { Card as MuiCard, Chip as MuiChip, IconButton as MuiIconButton, alpha } from '@mui/material';

export const Card = styled(MuiCard)<{ $transition?: boolean }>`
  background-color: ${({ theme }) => theme.palette.background.paper};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};

  ${({ $transition, theme }) =>
    $transition &&
    `
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: ${theme.shadows[4]};
    }
  `}
`;

export const Image = styled('img')<{ $height?: number }>`
  width: 100%;
  height: ${({ $height }) => $height || 200}px;
  object-fit: cover;
  display: block;
`;

export const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

export const Badge = styled(MuiChip)`
  position: absolute;
  top: ${({ theme }) => theme.spacing(3)};
  left: ${({ theme }) => theme.spacing(3)};
`;

export const MenuIconButton = styled(MuiIconButton)`
  position: absolute;
  top: ${({ theme }) => theme.spacing(2)};
  right: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => alpha(theme.palette.background.paper, 0.95)};
  border-radius: ${({ theme }) => theme.shape.xs}px !important;

  &:hover {
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
`;
