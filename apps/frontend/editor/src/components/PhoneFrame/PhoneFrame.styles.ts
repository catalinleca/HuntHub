import styled from 'styled-components';
import { Stack } from '@mui/material';
import {
  PHONE_SCREEN_WIDTH,
  PHONE_SCREEN_HEIGHT,
  PHONE_BEZEL_WIDTH,
  PHONE_BORDER_RADIUS,
} from '@/pages/Hunt/layout.constants';

const INNER_BORDER_RADIUS = PHONE_BORDER_RADIUS - PHONE_BEZEL_WIDTH;
const DYNAMIC_ISLAND_WIDTH = 80;
const DYNAMIC_ISLAND_HEIGHT = 24;
const STATUS_BAR_HEIGHT = 36;
const HOME_INDICATOR_WIDTH = 100;
const HOME_INDICATOR_HEIGHT = 4;
const BUTTON_WIDTH = 2;
const VOLUME_BUTTON_HEIGHT = 40;
const POWER_BUTTON_HEIGHT = 56;

export const DeviceFrame = styled(Stack)`
  position: relative;
  width: ${PHONE_SCREEN_WIDTH + PHONE_BEZEL_WIDTH * 2}px;
  height: ${PHONE_SCREEN_HEIGHT + PHONE_BEZEL_WIDTH * 2}px;
  background: ${({ theme }) => theme.palette.grey[900]};
  border-radius: ${PHONE_BORDER_RADIUS}px;
  padding: ${PHONE_BEZEL_WIDTH}px;
  box-shadow:
    inset 0 0 0 1px ${({ theme }) => theme.palette.grey[700]},
    ${({ theme }) => theme.shadows[4]};
`;

export const VolumeButtons = styled.div`
  position: absolute;
  left: -${BUTTON_WIDTH}px;
  top: 80px;
  width: ${BUTTON_WIDTH}px;
  height: ${VOLUME_BUTTON_HEIGHT}px;
  background: ${({ theme }) => theme.palette.grey[800]};
  border-radius: ${BUTTON_WIDTH}px 0 0 ${BUTTON_WIDTH}px;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: ${VOLUME_BUTTON_HEIGHT + 8}px;
    width: ${BUTTON_WIDTH}px;
    height: ${VOLUME_BUTTON_HEIGHT}px;
    background: ${({ theme }) => theme.palette.grey[800]};
    border-radius: ${BUTTON_WIDTH}px 0 0 ${BUTTON_WIDTH}px;
  }
`;

export const PowerButton = styled.div`
  position: absolute;
  right: -${BUTTON_WIDTH}px;
  top: 100px;
  width: ${BUTTON_WIDTH}px;
  height: ${POWER_BUTTON_HEIGHT}px;
  background: ${({ theme }) => theme.palette.grey[800]};
  border-radius: 0 ${BUTTON_WIDTH}px ${BUTTON_WIDTH}px 0;
`;

export const FrameInner = styled(Stack)`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.palette.grey[900]};
  border-radius: ${INNER_BORDER_RADIUS}px;
  overflow: hidden;
  position: relative;
`;

export const DynamicIsland = styled.div`
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: ${DYNAMIC_ISLAND_WIDTH}px;
  height: ${DYNAMIC_ISLAND_HEIGHT}px;
  background: ${({ theme }) => theme.palette.common.black};
  border-radius: ${DYNAMIC_ISLAND_HEIGHT / 2}px;
  z-index: 10;
`;

export const StatusBarContainer = styled(Stack)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: ${STATUS_BAR_HEIGHT}px;
  padding: 8px 16px 0;
  z-index: 5;
`;

export const Time = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.palette.common.white};
  letter-spacing: 0.5px;
`;

export const StatusIcons = styled(Stack)`
  color: ${({ theme }) => theme.palette.common.white};
`;

export const Screen = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.palette.background.surface};
  position: relative;
`;

export const HomeIndicator = styled.div`
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: ${HOME_INDICATOR_WIDTH}px;
  height: ${HOME_INDICATOR_HEIGHT}px;
  background: ${({ theme }) => theme.palette.grey[600]};
  border-radius: ${HOME_INDICATOR_HEIGHT / 2}px;
  z-index: 10;
`;
