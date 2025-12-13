import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Stack, Typography, IconButton } from '@mui/material';
import { ImageIcon, TrashIcon } from '@phosphor-icons/react';
import { MediaType } from '@hunthub/shared';
import type { Media } from '@hunthub/shared';
import { useGetAsset } from '@/api/Asset';
import { MediaPreview } from '@/components/media/MediaPreview';
import { MediaDetailsDrawer } from '@/components/media/MediaDetailsDrawer';
import * as S from './FormMediaInput.styles';

export interface FormMediaInputProps {
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Form bridge component for media selection.
 * Shows a preview when media is selected, or an "Add media" button when empty.
 * Opens MediaDetailsDrawer for selection and editing.
 */
export const FormMediaInput = ({ name, label = 'Media', description, disabled = false }: FormMediaInputProps) => {
  const { setValue } = useFormContext();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const media: Media | null | undefined = useWatch({ name });
  const hasMedia = media?.type != null;

  // Get primary asset ID for preview
  const primaryAssetId = getPrimaryAssetId(media);
  const { data: primaryAsset } = useGetAsset(primaryAssetId);

  const handleAddClick = () => {
    if (disabled) {
      return;
    }
    setDrawerOpen(true);
  };

  const handleSave = (newMedia: Media) => {
    setValue(name, newMedia, { shouldDirty: true });
    setDrawerOpen(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setValue(name, null, { shouldDirty: true });
  };

  const handleClose = () => {
    setDrawerOpen(false);
  };

  return (
    <>
      <Stack gap={1}>
        <S.SectionLabel>{label}</S.SectionLabel>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}

        {hasMedia ? (
          <S.MediaCard onClick={handleAddClick} $disabled={disabled}>
            <S.PreviewContainer>
              <MediaPreview asset={primaryAsset} mediaType={media?.type} height={120} />
            </S.PreviewContainer>
            <S.MediaInfo>
              <Typography variant="body2" fontWeight={500}>
                {getMediaTypeLabel(media?.type)}
              </Typography>
              {getMediaTitle(media) && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {getMediaTitle(media)}
                </Typography>
              )}
            </S.MediaInfo>
            {!disabled && (
              <IconButton size="small" onClick={handleRemove} sx={{ ml: 'auto' }} aria-label="Remove media">
                <TrashIcon size={18} />
              </IconButton>
            )}
          </S.MediaCard>
        ) : (
          <S.AddMediaButton onClick={handleAddClick} $disabled={disabled}>
            <ImageIcon size={20} aria-hidden="true" />
            <Typography variant="body2">Add media</Typography>
          </S.AddMediaButton>
        )}
      </Stack>

      <MediaDetailsDrawer open={drawerOpen} onClose={handleClose} onSave={handleSave} initialMedia={media} />
    </>
  );
};

/**
 * Get the primary asset ID from media content for preview
 */
function getPrimaryAssetId(media?: Media | null): number | null {
  if (!media?.content) {
    return null;
  }

  switch (media.type) {
    case MediaType.Image:
      return media.content.image?.assetId ? parseInt(media.content.image.assetId) : null;
    case MediaType.Audio:
      return media.content.audio?.assetId ? parseInt(media.content.audio.assetId) : null;
    case MediaType.Video:
      return media.content.video?.assetId ? parseInt(media.content.video.assetId) : null;
    case MediaType.ImageAudio:
      return media.content.imageAudio?.imageAssetId ? parseInt(media.content.imageAudio.imageAssetId) : null;
    default:
      return null;
  }
}

/**
 * Get human-readable label for media type
 */
function getMediaTypeLabel(type?: MediaType): string {
  switch (type) {
    case MediaType.Image:
      return 'Image';
    case MediaType.Audio:
      return 'Audio';
    case MediaType.Video:
      return 'Video';
    case MediaType.ImageAudio:
      return 'Image + Audio';
    default:
      return 'Media';
  }
}

/**
 * Get title from media content if available
 */
function getMediaTitle(media?: Media | null): string | undefined {
  if (!media?.content) {
    return undefined;
  }

  switch (media.type) {
    case MediaType.Image:
      return media.content.image?.title;
    case MediaType.Audio:
      return media.content.audio?.title;
    case MediaType.Video:
      return media.content.video?.title;
    case MediaType.ImageAudio:
      return media.content.imageAudio?.title;
    default:
      return undefined;
  }
}
