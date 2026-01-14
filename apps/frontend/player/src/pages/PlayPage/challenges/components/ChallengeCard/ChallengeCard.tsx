import React from 'react';
import { Typography, Stack } from '@mui/material';
import { MediaType } from '@hunthub/shared';
import type { Media } from '@hunthub/shared';
import type { BadgeConfig } from '@/constants';
import { MediaDisplay } from '@/components/media';
import { TypeBadge } from '../TypeBadge';
import { HintSection } from '../HintSection';
import { TimeLimit } from '../TimeLimit';
import { AttemptsCounter } from '../AttemptsCounter';
import { FeedbackDisplay } from '../FeedbackDisplay';
import * as S from './ChallengeCard.styles';

const VISUAL_MEDIA_TYPES: MediaType[] = [MediaType.Image, MediaType.Video, MediaType.ImageAudio];

interface ChallengeCardProps {
  children?: React.ReactNode;
  badge: BadgeConfig;
  title?: string;
  description?: string;
  footer: React.ReactNode;
  showHint?: boolean;
  // Step-level features
  media?: Media;
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
  const hasIndicators = timeLimit || maxAttempts;
  const hasVisualMedia = media && VISUAL_MEDIA_TYPES.includes(media.type);
  const hasAudioOnly = media?.type === MediaType.Audio;

  return (
    <S.Container>
      {hasIndicators && (
        <Stack direction="row" justifyContent="flex-end" gap={1}>
          {timeLimit && <TimeLimit seconds={timeLimit} onExpire={onTimeExpire} />}
          {maxAttempts && <AttemptsCounter current={currentAttempts} max={maxAttempts} onMaxAttempts={onMaxAttempts} />}
        </Stack>
      )}

      {hasVisualMedia && <MediaDisplay media={media} />}

      <TypeBadge {...badge} />

      {title && <Typography variant="h5">{title}</Typography>}
      {description && <Typography color="text.secondary">{description}</Typography>}

      <S.Content>
        {children}
        {hasAudioOnly && <MediaDisplay media={media} />}
      </S.Content>

      <FeedbackDisplay feedback={feedback ?? null} />

      {showHint && <HintSection />}

      <S.Footer>{footer}</S.Footer>
    </S.Container>
  );
};
