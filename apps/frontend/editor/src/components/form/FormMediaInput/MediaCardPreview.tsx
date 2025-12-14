import React from 'react';
import { Typography, IconButton, Stack } from '@mui/material';
import { TrashIcon } from '@phosphor-icons/react';
import type { Media, MediaType } from '@hunthub/shared';
import { MediaHelper } from '@/utils/data/media';
import { MediaPreview } from '@/components/media/MediaPreview';
import * as S from './FormMediaInput.styles';

export interface MediaCardPreviewProps {
  media: Media;
  disabled: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

const getSecondaryText = (media: Media): string | undefined => {
  const type = media.type as MediaType;

  // For audio types, show transcript if available
  if (type === 'audio' || type === 'image-audio') {
    const transcript = MediaHelper.getTranscript(media);
    if (transcript) {
      return transcript;
    }
  }

  // For image/video types, show alt text if available
  if (type === 'image' || type === 'video' || type === 'image-audio') {
    const alt = MediaHelper.getAlt(media);
    if (alt) {
      return alt;
    }
  }

  // Fallback to filename
  const asset = MediaHelper.getPrimaryAsset(media);
  return asset?.name;
};

export const MediaCardPreview = ({ media, disabled, onEdit, onRemove }: MediaCardPreviewProps) => {
  const primaryAsset = MediaHelper.getPrimaryAsset(media);
  const displayName = MediaHelper.getDisplayName(media);
  const secondaryText = getSecondaryText(media);

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
          {secondaryText && secondaryText !== displayName && (
            <Typography variant="caption" color="text.disabled" noWrap title={secondaryText}>
              {secondaryText}
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
