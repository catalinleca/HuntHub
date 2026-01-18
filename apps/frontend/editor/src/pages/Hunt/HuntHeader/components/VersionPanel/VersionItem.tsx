import { Stack, Typography, CircularProgress } from '@mui/material';
import { CheckIcon } from '@phosphor-icons/react';
import * as S from './VersionItem.styles';

interface VersionItemProps {
  version: number;
  publishedAt: string;
  stepCount: number;
  isLive: boolean;
  onSetAsLive: (version: number) => void;
  onTakeOffline: () => void;
  isSettingLive: boolean;
  isTakingOffline: boolean;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const VersionItem = ({
  version,
  publishedAt,
  stepCount,
  isLive,
  onSetAsLive,
  onTakeOffline,
  isSettingLive,
  isTakingOffline,
}: VersionItemProps) => {
  const isLoading = isSettingLive || isTakingOffline;

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <S.VersionRow $isLive={isLive} disableRipple>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flex={1}>
        <Stack direction="row" alignItems="center" gap={1}>
          {isLive && <CheckIcon size={14} weight="bold" />}
          <Typography variant="body2" fontWeight={isLive ? 600 : 400}>
            v{version} ({formatDate(publishedAt)}) · {stepCount} steps
          </Typography>
        </Stack>

        {isLive ? (
          <S.ActionButton
            size="small"
            color="warning"
            onClick={(e) => handleButtonClick(e, onTakeOffline)}
            disabled={isLoading}
          >
            {isTakingOffline ? <CircularProgress size={14} /> : 'Take Offline'}
          </S.ActionButton>
        ) : (
          <S.ActionButton
            size="small"
            color="success"
            onClick={(e) => handleButtonClick(e, () => onSetAsLive(version))}
            disabled={isLoading}
          >
            {isSettingLive ? <CircularProgress size={14} /> : 'Set as Live'}
          </S.ActionButton>
        )}
      </Stack>
    </S.VersionRow>
  );
};
