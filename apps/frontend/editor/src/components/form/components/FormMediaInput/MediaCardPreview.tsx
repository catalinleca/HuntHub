import React from 'react';
import { Typography, IconButton, Stack } from '@mui/material';
import { TrashIcon } from '@phosphor-icons/react';
import type { Media } from '@hunthub/shared';
import { MediaHelper } from '@/components/media/data';
import { MediaPreview } from '@/components/media';
import * as S from './FormMediaInput.styles';

export interface MediaCardPreviewProps {
  media: Media;
  disabled: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

export const MediaCardPreview = ({ media, disabled, onEdit, onRemove }: MediaCardPreviewProps) => {
  const primaryAsset = MediaHelper.getPrimaryAsset(media);
  const displayName = MediaHelper.getDisplayName(media);

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <S.MediaCard onClick={onEdit} $disabled={disabled}>
      <S.PreviewContainer>
        <MediaPreview asset={primaryAsset} mediaType={media.type} height={120} />
      </S.PreviewContainer>
      <S.MediaInfo>
        <Stack gap={1}>
          <Typography variant="body2" fontWeight={500}>
            {MediaHelper.getTypeLabel(media.type)}
          </Typography>
          {displayName && (
            <Typography variant="caption" color="text.secondary" noWrap title={displayName}>
              {displayName}
            </Typography>
          )}
        </Stack>
      </S.MediaInfo>
      {!disabled && (
        <IconButton size="small" onClick={handleRemoveClick} sx={{ ml: 'auto' }} aria-label="Remove media">
          <TrashIcon size={18} />
        </IconButton>
      )}
    </S.MediaCard>
  );
};
