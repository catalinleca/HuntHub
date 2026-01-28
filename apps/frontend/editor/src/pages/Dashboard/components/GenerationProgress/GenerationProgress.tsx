import { useState, useEffect } from 'react';
import { Stack, CircularProgress, Typography } from '@mui/material';
import { PROGRESS_MESSAGES, TYPING_SPEED_MS, MESSAGE_DISPLAY_MS } from './constants';
import * as S from './GenerationProgress.styles';

export const GenerationProgress = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);

  const currentMessage = PROGRESS_MESSAGES[messageIndex];

  if (!currentMessage) {
    return null;
  }

  const isTypingComplete = displayedChars >= currentMessage.length;
  const isLastMessage = messageIndex >= PROGRESS_MESSAGES.length - 1;

  useEffect(() => {
    if (isTypingComplete) {
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedChars((prev) => prev + 1);
    }, TYPING_SPEED_MS);

    return () => clearTimeout(timer);
  }, [displayedChars, isTypingComplete]);

  useEffect(() => {
    if (!isTypingComplete || isLastMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setMessageIndex((prev) => prev + 1);
      setDisplayedChars(0);
    }, MESSAGE_DISPLAY_MS);

    return () => clearTimeout(timer);
  }, [isTypingComplete, isLastMessage]);

  return (
    <Stack alignItems="center" justifyContent="center" sx={{ py: 8, px: 4 }}>
      <S.Card>
        <CircularProgress size={48} />
        <Typography variant="body1" color="text.secondary">
          {currentMessage.slice(0, displayedChars)}
          {!isTypingComplete && <S.Cursor>|</S.Cursor>}
        </Typography>
      </S.Card>
    </Stack>
  );
};
