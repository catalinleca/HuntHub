import React from 'react';
import { ToggleButtonGroup, ToggleButton, Stack, Typography, Tooltip } from '@mui/material';
import { ImageIcon, WaveformIcon, VideoIcon, ImagesIcon } from '@phosphor-icons/react';
import { MediaType } from '@hunthub/shared';

export interface MediaTypeSelectorProps {
  value: MediaType;
  onChange: (type: MediaType) => void;
}

const MEDIA_TYPES: { value: MediaType; label: string; icon: React.ReactNode }[] = [
  { value: MediaType.Image, label: 'Image', icon: <ImageIcon size={20} /> },
  { value: MediaType.Audio, label: 'Audio', icon: <WaveformIcon size={20} /> },
  { value: MediaType.Video, label: 'Video', icon: <VideoIcon size={20} /> },
  { value: MediaType.ImageAudio, label: 'Image + Audio', icon: <ImagesIcon size={20} /> },
];

export const MediaTypeSelector = ({ value, onChange }: MediaTypeSelectorProps) => {
  const handleChange = (_: React.MouseEvent, newValue: MediaType | null) => {
    if (newValue) {
      onChange(newValue);
    }
  };

  return (
    <Stack gap={1} alignItems="flex-start">
      <Typography variant="body2" color="text.secondary">
        Media Type
      </Typography>
      <ToggleButtonGroup value={value} exclusive onChange={handleChange} size="small">
        {MEDIA_TYPES.map((type) => (
          <Tooltip key={type.value} title={type.label}>
            <ToggleButton value={type.value} aria-label={type.label}>
              {type.icon}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    </Stack>
  );
};
