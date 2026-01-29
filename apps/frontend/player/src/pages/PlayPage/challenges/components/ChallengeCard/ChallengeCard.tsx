import React, { useState } from 'react';
import { Typography } from '@mui/material';
import { MediaType } from '@hunthub/shared';
import type { Media } from '@hunthub/shared';
import type { BadgeConfig } from '@/constants';
import { MediaDisplay } from '@/components/media';
import { useSessionActions, useStepPlayProgress, useHuntMeta, useStepProgress } from '@/context';
import { useIsCorrect } from '@/context/Validation';
import { TypeBadge, BadgeContainer } from '../TypeBadge';
import { HintSection } from '../HintSection';
import { FeedbackDisplay } from '../FeedbackDisplay';
import { ChallengeHeader } from './ChallengeHeader';
import { AbandonDialog } from './AbandonDialog';
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
  const hasMedia = !!media;
  const needsBorderedContainer = media && BORDERED_MEDIA_TYPES.includes(media.type);
  const hasContent = title || description;
  const feedbackVariant = isCorrect === true ? 'success' : 'info';

  return (
    <S.Container>
      <ChallengeHeader
        huntName={huntMeta?.name}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        remainingSeconds={remainingSeconds}
        maxAttempts={maxAttempts}
        currentAttempts={currentAttempts}
        onAbandonClick={() => setShowAbandonDialog(true)}
        onTimeExpire={onTimeExpire}
        onMaxAttempts={onMaxAttempts}
      />

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

      <AbandonDialog open={showAbandonDialog} onClose={() => setShowAbandonDialog(false)} onConfirm={abandonSession} />
    </S.Container>
  );
};
