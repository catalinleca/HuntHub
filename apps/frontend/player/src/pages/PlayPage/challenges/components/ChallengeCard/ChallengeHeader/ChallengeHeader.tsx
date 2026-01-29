import { Stack, IconButton, Typography } from '@mui/material';
import { XIcon } from '@phosphor-icons/react';
import { TimeLimit } from '../../TimeLimit';
import { AttemptsCounter } from '../../AttemptsCounter';
import * as S from './ChallengeHeader.styles';

interface ChallengeHeaderProps {
  huntName?: string;
  currentStepIndex: number;
  totalSteps: number;
  remainingSeconds: number | null;
  maxAttempts?: number | null;
  currentAttempts: number;
  onAbandonClick: () => void;
  onTimeExpire?: () => void;
  onMaxAttempts?: () => void;
}

export const ChallengeHeader = ({
  huntName,
  currentStepIndex,
  totalSteps,
  remainingSeconds,
  maxAttempts,
  currentAttempts,
  onAbandonClick,
  onTimeExpire,
  onMaxAttempts,
}: ChallengeHeaderProps) => {
  const hasIndicators = remainingSeconds !== null || maxAttempts;
  const hasStepProgress = totalSteps > 0;

  return (
    <>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <IconButton size="small" onClick={onAbandonClick}>
          <XIcon size={16} />
        </IconButton>

        {huntName && <S.HuntTitle>{huntName}</S.HuntTitle>}

        <Stack direction="row" alignItems="center" gap={1}>
          {hasIndicators && (
            <>
              {remainingSeconds !== null && <TimeLimit seconds={remainingSeconds} onExpire={onTimeExpire} />}
              {maxAttempts && (
                <AttemptsCounter current={currentAttempts} max={maxAttempts} onMaxAttempts={onMaxAttempts} />
              )}
            </>
          )}
          {hasStepProgress && (
            <S.StepBadge>
              <Typography variant="xsRegular" color="grey.500">
                {currentStepIndex + 1} / {totalSteps}
              </Typography>
            </S.StepBadge>
          )}
        </Stack>
      </Stack>

      <S.Divider_ />
    </>
  );
};
