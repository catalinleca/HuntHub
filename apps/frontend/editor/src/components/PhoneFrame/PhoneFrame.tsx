import { CellSignalFullIcon, WifiHighIcon, BatteryFullIcon } from '@phosphor-icons/react';
import * as S from './PhoneFrame.styles';

interface PhoneFrameProps {
  children: React.ReactNode;
}

const StatusBar = () => (
  <S.StatusBarContainer direction="row" justifyContent="space-between" alignItems="flex-start">
    <S.Time>9:41</S.Time>
    <S.StatusIcons direction="row" alignItems="center" gap={1}>
      <CellSignalFullIcon size={16} weight="fill" />
      <WifiHighIcon size={16} weight="fill" />
      <BatteryFullIcon size={20} weight="fill" />
    </S.StatusIcons>
  </S.StatusBarContainer>
);

export const PhoneFrame = ({ children }: PhoneFrameProps) => (
  <S.DeviceFrame>
    <S.VolumeButtons />
    <S.PowerButton />
    <S.FrameInner>
      <S.DynamicIsland />
      <StatusBar />
      <S.Screen>{children}</S.Screen>
      <S.HomeIndicator />
    </S.FrameInner>
  </S.DeviceFrame>
);
