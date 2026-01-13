import { useState, useRef, useCallback } from 'react';
import { useInterval } from 'react-use';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';
import { TimerIcon } from '@phosphor-icons/react';
import * as S from './TimeLimit.styles';

interface TimeLimitProps {
  seconds: number;
  onExpire?: () => void;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const TimeLimit = ({ seconds, onExpire }: TimeLimitProps) => {
  const endTime = useRef(Date.now() + seconds * 1000);
  const [remaining, setRemaining] = useState(seconds);
  const [showDialog, setShowDialog] = useState(false);
  const hasExpired = useRef(false);

  useInterval(
    () => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.ceil((endTime.current - now) / 1000));
      setRemaining(timeLeft);

      if (timeLeft === 0 && !hasExpired.current) {
        hasExpired.current = true;
        setShowDialog(true);
      }
    },
    hasExpired.current ? null : 1000
  );

  const handleAcknowledge = useCallback(() => {
    setShowDialog(false);
    onExpire?.();
  }, [onExpire]);

  const isWarning = remaining <= 30 && remaining > 0;
  const isExpired = remaining === 0;

  return (
    <>
      <S.TimerBadge $isWarning={isWarning} $isExpired={isExpired}>
        <TimerIcon size={16} weight={isWarning ? 'fill' : 'regular'} />
        <Typography variant="caption" fontWeight={600}>
          {formatTime(remaining)}
        </Typography>
      </S.TimerBadge>

      <Dialog open={showDialog} onClose={handleAcknowledge}>
        <DialogTitle>
          <S.DialogHeader>
            <TimerIcon size={24} weight="fill" />
            Time's up!
          </S.DialogHeader>
        </DialogTitle>
        <DialogContent>
          <Typography>The time limit for this step has expired.</Typography>
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
