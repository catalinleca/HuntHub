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
import { usePlaySession } from '@/context';
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
  const { abandonSession } = usePlaySession();
  const [showAbandonDialog, setShowAbandonDialog] = useState(false);

  const hasIndicators = timeLimit || maxAttempts;
  const hasVisualMedia = media && VISUAL_MEDIA_TYPES.includes(media.type);
  const hasAudioOnly = media?.type === MediaType.Audio;

  // TODO: fix Dialog, move it into its own folder and code properly
  return (
    <S.Container>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <IconButton size="small" onClick={() => setShowAbandonDialog(true)}>
          <XIcon size={20} />
        </IconButton>
        {hasIndicators && (
          <Stack direction="row" gap={1}>
            {timeLimit && <TimeLimit seconds={timeLimit} onExpire={onTimeExpire} />}
            {maxAttempts && (
              <AttemptsCounter current={currentAttempts} max={maxAttempts} onMaxAttempts={onMaxAttempts} />
            )}
          </Stack>
        )}
      </Stack>

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

      <Dialog open={showAbandonDialog} onClose={() => setShowAbandonDialog(false)}>
        <DialogTitle>Abandon Hunt?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to abandon this hunt? Your progress will be lost.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAbandonDialog(false)}>No, Continue</Button>
          <Button variant="contained" color="error" onClick={abandonSession}>
            Yes, Abandon
          </Button>
        </DialogActions>
      </Dialog>
    </S.Container>
  );
};
