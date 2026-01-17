import styled from 'styled-components';
import { Box, Stack, Typography } from '@mui/material';

const ZoneBase = styled(Stack)`
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(4)};
  min-height: 160px;
  background-color: ${({ theme }) => theme.palette.grey[50]};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

export const StatusZone = styled(ZoneBase)`
  border: 1px solid ${({ theme }) => theme.palette.grey[300]};
`;

export const UploadZone = styled(ZoneBase)`
  border: 2px dashed ${({ theme }) => theme.palette.grey[300]};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.palette.primary.main};
    background-color: ${({ theme }) => theme.palette.grey[100]};
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const IconWrapper = styled(Stack)<{ $color?: string }>`
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${({ theme, $color }) => $color || theme.palette.primary.light}20;
  color: ${({ theme, $color }) => $color || theme.palette.primary.main};
`;

export const StatusIndicator = styled(Stack)<{ $isSuccess?: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(3, 2)};
  background-color: ${({ theme, $isSuccess }) =>
    $isSuccess ? theme.palette.success.light + '20' : theme.palette.grey[100]};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  color: ${({ theme, $isSuccess }) => ($isSuccess ? theme.palette.success.dark : theme.palette.text.secondary)};
`;

export const PreviewImage = styled.img`
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

export const AudioPlayerContainer = styled(Box)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.palette.grey[50]};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
`;

export const TimerDisplay = styled(Typography)`
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`;

export const RecordingDot = styled(Box)`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.palette.error.main};
  animation: pulse 1.5s ease-in-out infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
`;

export const HiddenInput = styled.input`
  display: none;
`;

export const DistanceText = styled(Typography)<{ $inRange?: boolean }>`
  font-weight: 600;
  color: ${({ theme, $inRange }) => ($inRange ? theme.palette.success.main : theme.palette.warning.main)};
`;
