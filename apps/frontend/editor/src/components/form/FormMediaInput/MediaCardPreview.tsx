import { Typography, IconButton } from '@mui/material';
import { TrashIcon } from '@phosphor-icons/react';
import type { Media } from '@hunthub/shared';
import { MediaHelper } from '@/utils/data/media';
import { MediaPreview } from '@/components/media/MediaPreview';
import * as S from './FormMediaInput.styles';

export interface MediaCardPreviewProps {
  media: Media;
  disabled: boolean;
  onEdit: () => void;
  onRemove: () => void;
}

export const MediaCardPreview = ({ media, disabled, onEdit, onRemove }: MediaCardPreviewProps) => {
  const primaryAsset = MediaHelper.getPrimaryAsset(media);

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
        <Typography variant="body2" fontWeight={500}>
          {MediaHelper.getTypeLabel(media.type)}
        </Typography>
        {MediaHelper.getTitle(media) && (
          <Typography variant="caption" color="text.secondary" noWrap>
            {MediaHelper.getTitle(media)}
          </Typography>
        )}
      </S.MediaInfo>
      {!disabled && (
        <IconButton size="small" onClick={handleRemoveClick} sx={{ ml: 'auto' }} aria-label="Remove media">
          <TrashIcon size={18} />
        </IconButton>
      )}
    </S.MediaCard>
  );
};
