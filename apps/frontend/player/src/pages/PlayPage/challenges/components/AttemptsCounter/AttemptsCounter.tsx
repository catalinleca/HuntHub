import { useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { TargetIcon } from '@phosphor-icons/react';
import * as S from './AttemptsCounter.styles';

interface AttemptsCounterProps {
  current: number;
  max: number;
  onMaxAttempts?: () => void;
}

export const AttemptsCounter = ({ current, max, onMaxAttempts }: AttemptsCounterProps) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const remaining = max - current;
  const isLastAttempt = remaining === 1;
  const isExhausted = remaining <= 0;

  // Declarative: show dialog when exhausted and not yet acknowledged
  const showDialog = isExhausted && !acknowledged;

  const handleAcknowledge = useCallback(() => {
    setAcknowledged(true);
    onMaxAttempts?.();
  }, [onMaxAttempts]);

  return (
    <>
      <S.AttemptsBadge $isWarning={isLastAttempt} $isExhausted={isExhausted}>
        <TargetIcon size={16} weight={isLastAttempt ? 'fill' : 'regular'} />
        <Typography variant="caption" fontWeight={600}>
          {current}/{max}
        </Typography>
      </S.AttemptsBadge>

      <Dialog open={showDialog} onClose={handleAcknowledge}>
        <DialogTitle>
          <S.DialogHeader>
            <TargetIcon size={24} weight="fill" />
            No attempts remaining
          </S.DialogHeader>
        </DialogTitle>
        <DialogContent>
          <Typography>You've used all available attempts for this step.</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleAcknowledge}>
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
