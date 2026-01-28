import { IconButton, Tooltip } from '@mui/material';
import { CheckIcon, XIcon, ArrowSquareOutIcon, CopyIcon } from '@phosphor-icons/react';
import type { ValidationMode } from '@hunthub/player-sdk';
import * as S from './PreviewControlBar.styles';

interface PreviewControlBarProps {
  validationMode: ValidationMode;
  onModeChange: (mode: ValidationMode) => void;
  onOpenInBrowser: () => void;
  onCopyLink: () => void;
  isLoading: boolean;
}

interface SimulationToggleProps {
  mode: ValidationMode;
  onChange: (mode: ValidationMode) => void;
}

const SimulationToggle = ({ mode, onChange }: SimulationToggleProps) => (
  <S.ToggleGroup direction="row" sx={{ pr: 2 }}>
    <S.ToggleButton $isActive={mode === 'success'} $variant="success" onClick={() => onChange('success')}>
      <CheckIcon size={14} weight="bold" />
      Pass
    </S.ToggleButton>
    <S.ToggleButton $isActive={mode === 'fail'} $variant="fail" onClick={() => onChange('fail')}>
      <XIcon size={14} weight="bold" />
      Fail
    </S.ToggleButton>
  </S.ToggleGroup>
);

export const PreviewControlBar = ({
  validationMode,
  onModeChange,
  onOpenInBrowser,
  onCopyLink,
  isLoading,
}: PreviewControlBarProps) => (
  <S.Container direction="row" alignItems="center">
    <SimulationToggle mode={validationMode} onChange={onModeChange} />
    <S.Divider orientation="vertical" flexItem />
    <S.ActionButtons direction="row" alignItems="center">
      <Tooltip title="Open in Browser" placement="top" arrow>
        <IconButton size="small" onClick={onOpenInBrowser} disabled={isLoading}>
          <ArrowSquareOutIcon size={18} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Copy Link" placement="top" arrow>
        <IconButton size="small" onClick={onCopyLink} disabled={isLoading}>
          <CopyIcon size={18} />
        </IconButton>
      </Tooltip>
    </S.ActionButtons>
  </S.Container>
);
