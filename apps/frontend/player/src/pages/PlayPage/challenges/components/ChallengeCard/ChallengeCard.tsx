import React, { useState } from 'react';
import {
  Typography,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { XIcon } from '@phosphor-icons/react';
import { MediaType } from '@hunthub/shared';
import type { Media } from '@hunthub/shared';
import type { BadgeConfig } from '@/constants';
import { MediaDisplay } from '@/components/media';
import { useSessionActions, useStepPlayProgress, useHuntMeta, useStepProgress } from '@/context';
import { useIsCorrect } from '@/context/Validation';
import { TypeBadge, BadgeContainer } from '../TypeBadge';
import { HintSection } from '../HintSection';
import { TimeLimit } from '../TimeLimit';
import { AttemptsCounter } from '../AttemptsCounter';
import { FeedbackDisplay } from '../FeedbackDisplay';
import * as S from './ChallengeCard.styles';

const BORDERED_MEDIA_TYPES: MediaType[] = [MediaType.Image, MediaType.Video, MediaType.ImageAudio];

const calculateRemainingSeconds = (timeLimit: number, startedAt: string | null): number => {
  if (!startedAt) {
    return timeLimit;
  }

  const startTime = new Date(startedAt).getTime();
  if (Number.isNaN(startTime)) {
    return timeLimit;
  }

  const elapsedMs = Date.now() - startTime;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  return Math.max(0, timeLimit - elapsedSeconds);
};

interface ChallengeCardProps {
  children?: React.ReactNode;
  badge: BadgeConfig;
  title?: string;
  description?: string;
  footer: React.ReactNode;
  showHint?: boolean;
  media?: Media | null;
  timeLimit?: number | null;
  maxAttempts?: number | null;
  currentAttempts?: number;
  feedback?: string | null;
  onTimeExpire?: () => void;
  onMaxAttempts?: () => void;
}

export const ChallengeCard = ({
  badge,
  title,
  description,
  children,
  footer,
  showHint,
  media,
  timeLimit,
  maxAttempts,
  currentAttempts = 0,
  feedback,
  onTimeExpire,
  onMaxAttempts,
}: ChallengeCardProps) => {
  const { abandonSession } = useSessionActions();
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);
  const isCorrect = useIsCorrect();
  const stepPlayProgress = useStepPlayProgress();
  const huntMeta = useHuntMeta();
  const { currentStepIndex, totalSteps } = useStepProgress();

  const remainingSeconds = timeLimit ? calculateRemainingSeconds(timeLimit, stepPlayProgress?.startedAt ?? null) : null;

  const hasIndicators = timeLimit || maxAttempts;
  const hasMedia = !!media;
  const needsBorderedContainer = media && BORDERED_MEDIA_TYPES.includes(media.type);
  const hasContent = title || description;
  const feedbackVariant = isCorrect === true ? 'success' : 'info';
  const hasStepProgress = totalSteps > 0;

  return (
    <S.Container>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <IconButton size="small" onClick={() => setShowAbandonDialog(true)}>
          <XIcon size={20} />
        </IconButton>
        {huntMeta?.name && <S.HuntTitle>{huntMeta.name}</S.HuntTitle>}
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
              {currentStepIndex + 1} / {totalSteps}
            </S.StepBadge>
          )}
        </Stack>
      </Stack>

      <S.HeaderDivider />

      <BadgeContainer>
        <TypeBadge {...badge} />
      </BadgeContainer>

      {hasMedia &&
        (needsBorderedContainer ? (
          <S.MediaCard>
            <MediaDisplay media={media} />
          </S.MediaCard>
        ) : (
          <MediaDisplay media={media} />
        ))}

      {hasContent && (
        <S.ContentCard>
          {title && <Typography variant="h5">{title}</Typography>}
          {description && (
            <Typography variant="bodyItalic" color="text.secondary">
              {description}
            </Typography>
          )}
        </S.ContentCard>
      )}

      <S.Content>{children}</S.Content>

      <FeedbackDisplay feedback={feedback ?? null} variant={feedbackVariant} />

      {showHint && <HintSection />}

      <S.Footer>{footer}</S.Footer>

      <Dialog open={showAbandonDialog} onClose={() => setShowAbandonDialog(false)}>
        <DialogTitle>Abandon Hunt?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to abandon this hunt? Your progress will be lost.</Typography>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={() => setShowAbandonDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={abandonSession}>
            Abandon
          </Button>
        </DialogActions>
      </Dialog>
    </S.Container>
  );
};
