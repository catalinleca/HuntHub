import { useState, useMemo, useCallback } from 'react';
import { Drawer, Stack, Typography, IconButton, Button, Box, TextField, Divider } from '@mui/material';
import { XIcon } from '@phosphor-icons/react';
import { useForm, Controller } from 'react-hook-form';
import { MediaType } from '@hunthub/shared';
import type { Media, Asset } from '@hunthub/shared';
import { useAssetsQuery, useGetAsset } from '@/api/Asset';
import { MediaPreview } from '../MediaPreview';
import { RecentAssets } from '../RecentAssets';
import { AssetLibraryDrawer } from '../AssetLibraryDrawer';
import { MediaTypeSelector } from './MediaTypeSelector';

export interface MediaDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (media: Media) => void;
  initialMedia?: Media | null;
}

interface MediaFormData {
  type: MediaType;
  // Image fields
  imageAssetId: string;
  imageTitle: string;
  imageAlt: string;
  // Audio fields
  audioAssetId: string;
  audioTitle: string;
  audioTranscript: string;
  // Video fields
  videoAssetId: string;
  videoTitle: string;
  videoAlt: string;
}

const DRAWER_WIDTH = 400;
const DRAWER_Z_INDEX = 1200;

const getDefaultValues = (media?: Media | null): MediaFormData => {
  if (!media) {
    return {
      type: MediaType.Image,
      imageAssetId: '',
      imageTitle: '',
      imageAlt: '',
      audioAssetId: '',
      audioTitle: '',
      audioTranscript: '',
      videoAssetId: '',
      videoTitle: '',
      videoAlt: '',
    };
  }

  const defaults: MediaFormData = {
    type: media.type,
    imageAssetId: '',
    imageTitle: '',
    imageAlt: '',
    audioAssetId: '',
    audioTitle: '',
    audioTranscript: '',
    videoAssetId: '',
    videoTitle: '',
    videoAlt: '',
  };

  switch (media.type) {
    case MediaType.Image:
      defaults.imageAssetId = media.content.image?.assetId || '';
      defaults.imageTitle = media.content.image?.title || '';
      defaults.imageAlt = media.content.image?.alt || '';
      break;
    case MediaType.Audio:
      defaults.audioAssetId = media.content.audio?.assetId || '';
      defaults.audioTitle = media.content.audio?.title || '';
      defaults.audioTranscript = media.content.audio?.transcript || '';
      break;
    case MediaType.Video:
      defaults.videoAssetId = media.content.video?.assetId || '';
      defaults.videoTitle = media.content.video?.title || '';
      defaults.videoAlt = media.content.video?.alt || '';
      break;
    case MediaType.ImageAudio:
      defaults.imageAssetId = media.content.imageAudio?.imageAssetId || '';
      defaults.audioAssetId = media.content.imageAudio?.audioAssetId || '';
      defaults.imageTitle = media.content.imageAudio?.title || '';
      break;
  }

  return defaults;
};

const formDataToMedia = (data: MediaFormData): Media => {
  switch (data.type) {
    case MediaType.Image:
      return {
        type: MediaType.Image,
        content: {
          image: {
            assetId: data.imageAssetId,
            title: data.imageTitle || undefined,
            alt: data.imageAlt || undefined,
          },
        },
      };
    case MediaType.Audio:
      return {
        type: MediaType.Audio,
        content: {
          audio: {
            assetId: data.audioAssetId,
            title: data.audioTitle || undefined,
            transcript: data.audioTranscript || undefined,
          },
        },
      };
    case MediaType.Video:
      return {
        type: MediaType.Video,
        content: {
          video: {
            assetId: data.videoAssetId,
            title: data.videoTitle || undefined,
            alt: data.videoAlt || undefined,
          },
        },
      };
    case MediaType.ImageAudio:
      return {
        type: MediaType.ImageAudio,
        content: {
          imageAudio: {
            imageAssetId: data.imageAssetId,
            audioAssetId: data.audioAssetId,
            title: data.imageTitle || undefined,
          },
        },
      };
  }
};

export const MediaDetailsDrawer = ({ open, onClose, onSave, initialMedia }: MediaDetailsDrawerProps) => {
  const [assetLibraryOpen, setAssetLibraryOpen] = useState(false);
  const [assetLibraryTarget, setAssetLibraryTarget] = useState<'image' | 'audio' | 'video'>('image');

  // Pattern 2: Stable Form Values - memoize to prevent infinite re-renders
  // React Hook Form's `values` prop triggers reset when reference changes
  const formValues = useMemo(() => (open ? getDefaultValues(initialMedia) : undefined), [open, initialMedia]);

  const { control, watch, setValue, getValues, handleSubmit } = useForm<MediaFormData>({
    defaultValues: getDefaultValues(null),
    values: formValues,
  });

  const mediaType = watch('type');
  const imageAssetId = watch('imageAssetId');
  const audioAssetId = watch('audioAssetId');
  const videoAssetId = watch('videoAssetId');

  // Pattern 4: Conditional Query Fetching - only fetch assets needed for current media type
  const needsImage = mediaType === MediaType.Image || mediaType === MediaType.ImageAudio;
  const needsAudio = mediaType === MediaType.Audio || mediaType === MediaType.ImageAudio;
  const needsVideo = mediaType === MediaType.Video;

  const { data: imageAsset } = useGetAsset(needsImage && imageAssetId ? parseInt(imageAssetId) : null);
  const { data: audioAsset } = useGetAsset(needsAudio && audioAssetId ? parseInt(audioAssetId) : null);
  const { data: videoAsset } = useGetAsset(needsVideo && videoAssetId ? parseInt(videoAssetId) : null);

  // Fetch recent assets for the carousel
  const { data: recentAssetsResponse, isLoading: recentLoading } = useAssetsQuery({
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const recentAssets = useMemo(() => {
    if (!recentAssetsResponse?.data) return [];

    // Filter by current media type
    if (mediaType === MediaType.Image || mediaType === MediaType.ImageAudio) {
      return recentAssetsResponse.data.filter((a) => a.mimeType.startsWith('image/'));
    }
    if (mediaType === MediaType.Audio) {
      return recentAssetsResponse.data.filter((a) => a.mimeType.startsWith('audio/'));
    }
    if (mediaType === MediaType.Video) {
      return recentAssetsResponse.data.filter((a) => a.mimeType.startsWith('video/'));
    }
    return recentAssetsResponse.data;
  }, [recentAssetsResponse?.data, mediaType]);

  // Pattern 1: Selective Memoization - only memoize callbacks passed to child components
  const handleOpenAssetLibrary = useCallback((target: 'image' | 'audio' | 'video') => {
    setAssetLibraryTarget(target);
    setAssetLibraryOpen(true);
  }, []);

  const handleAssetSelect = useCallback(
    (asset: Asset) => {
      const assetIdStr = asset.assetId.toString();
      switch (assetLibraryTarget) {
        case 'image':
          setValue('imageAssetId', assetIdStr, { shouldDirty: true });
          break;
        case 'audio':
          setValue('audioAssetId', assetIdStr, { shouldDirty: true });
          break;
        case 'video':
          setValue('videoAssetId', assetIdStr, { shouldDirty: true });
          break;
      }
      setAssetLibraryOpen(false);
    },
    [assetLibraryTarget, setValue],
  );

  const handleRecentAssetClick = useCallback(
    (asset: Asset) => {
      const assetIdStr = asset.assetId.toString();
      if (asset.mimeType.startsWith('image/')) {
        setValue('imageAssetId', assetIdStr, { shouldDirty: true });
      } else if (asset.mimeType.startsWith('audio/')) {
        setValue('audioAssetId', assetIdStr, { shouldDirty: true });
      } else if (asset.mimeType.startsWith('video/')) {
        setValue('videoAssetId', assetIdStr, { shouldDirty: true });
      }
    },
    [setValue],
  );

  // Shared save logic - used by form submit and double-click
  const saveMedia = useCallback(
    (data: MediaFormData) => {
      const media = formDataToMedia(data);
      onSave(media);
    },
    [onSave],
  );

  // Double-click = select asset + save immediately
  const handleRecentAssetDoubleClick = useCallback(
    (asset: Asset) => {
      const data = { ...getValues() };
      const assetIdStr = asset.assetId.toString();

      if (asset.mimeType.startsWith('image/')) {
        data.imageAssetId = assetIdStr;
      } else if (asset.mimeType.startsWith('audio/')) {
        data.audioAssetId = assetIdStr;
      } else if (asset.mimeType.startsWith('video/')) {
        data.videoAssetId = assetIdStr;
      }

      saveMedia(data);
    },
    [getValues, saveMedia],
  );

  const onSubmit = saveMedia;

  const handleClose = () => {
    onClose();
  };

  const canSave = useMemo(() => {
    switch (mediaType) {
      case MediaType.Image:
        return !!imageAssetId;
      case MediaType.Audio:
        return !!audioAssetId;
      case MediaType.Video:
        return !!videoAssetId;
      case MediaType.ImageAudio:
        return !!imageAssetId && !!audioAssetId;
    }
  }, [mediaType, imageAssetId, audioAssetId, videoAssetId]);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        sx={{
          zIndex: DRAWER_Z_INDEX,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Stack component="form" onSubmit={handleSubmit(onSubmit)} sx={{ height: '100%' }}>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            <Typography variant="h6">Media Details</Typography>
            <IconButton onClick={handleClose} size="small">
              <XIcon size={20} />
            </IconButton>
          </Stack>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <Stack gap={3}>
              {/* Type selector */}
              <Controller
                name="type"
                control={control}
                render={({ field }) => <MediaTypeSelector value={field.value} onChange={field.onChange} />}
              />

              <Divider />

              {/* Recent assets */}
              {recentAssets.length > 0 && (
                <RecentAssets
                  assets={recentAssets}
                  selectedAssetId={
                    mediaType === MediaType.Video
                      ? videoAssetId
                        ? parseInt(videoAssetId)
                        : null
                      : mediaType === MediaType.Audio
                        ? audioAssetId
                          ? parseInt(audioAssetId)
                          : null
                        : imageAssetId
                          ? parseInt(imageAssetId)
                          : null
                  }
                  onAssetClick={handleRecentAssetClick}
                  onAssetDoubleClick={handleRecentAssetDoubleClick}
                  isLoading={recentLoading}
                  title="Recent"
                />
              )}

              {/* Image section */}
              {(mediaType === MediaType.Image || mediaType === MediaType.ImageAudio) && (
                <Stack gap={2}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Image
                  </Typography>
                  <MediaPreview
                    asset={imageAsset}
                    mediaType={MediaType.Image}
                    onClick={() => handleOpenAssetLibrary('image')}
                    emptyText="Click to select an image"
                    height={180}
                  />
                  <Controller
                    name="imageTitle"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Title" size="small" fullWidth placeholder="Optional title" />
                    )}
                  />
                  {mediaType === MediaType.Image && (
                    <Controller
                      name="imageAlt"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Alt text"
                          size="small"
                          fullWidth
                          placeholder="Description for accessibility"
                          multiline
                          rows={2}
                        />
                      )}
                    />
                  )}
                </Stack>
              )}

              {/* Audio section */}
              {(mediaType === MediaType.Audio || mediaType === MediaType.ImageAudio) && (
                <Stack gap={2}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Audio
                  </Typography>
                  <MediaPreview
                    asset={audioAsset}
                    mediaType={MediaType.Audio}
                    onClick={() => handleOpenAssetLibrary('audio')}
                    emptyText="Click to select audio"
                    height={120}
                  />
                  {mediaType === MediaType.Audio && (
                    <>
                      <Controller
                        name="audioTitle"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="Title" size="small" fullWidth placeholder="Optional title" />
                        )}
                      />
                      <Controller
                        name="audioTranscript"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Transcript"
                            size="small"
                            fullWidth
                            placeholder="Text transcript for accessibility"
                            multiline
                            rows={3}
                          />
                        )}
                      />
                    </>
                  )}
                </Stack>
              )}

              {/* Video section */}
              {mediaType === MediaType.Video && (
                <Stack gap={2}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Video
                  </Typography>
                  <MediaPreview
                    asset={videoAsset}
                    mediaType={MediaType.Video}
                    onClick={() => handleOpenAssetLibrary('video')}
                    emptyText="Click to select a video"
                    height={180}
                  />
                  <Controller
                    name="videoTitle"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Title" size="small" fullWidth placeholder="Optional title" />
                    )}
                  />
                  <Controller
                    name="videoAlt"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Alt text"
                        size="small"
                        fullWidth
                        placeholder="Description for accessibility"
                        multiline
                        rows={2}
                      />
                    )}
                  />
                </Stack>
              )}
            </Stack>
          </Box>

          {/* Footer */}
          <Stack direction="row" justifyContent="flex-end" gap={1} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={!canSave}>
              Save
            </Button>
          </Stack>
        </Stack>
      </Drawer>

      {/* Asset Library Drawer */}
      <AssetLibraryDrawer
        open={assetLibraryOpen}
        onClose={() => setAssetLibraryOpen(false)}
        onSelect={handleAssetSelect}
        filterType={assetLibraryTarget}
      />
    </>
  );
};
