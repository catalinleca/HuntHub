import { Typography, Stack } from '@mui/material';
import { CloudArrowUpIcon } from '@phosphor-icons/react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { useCallback } from 'react';
import * as S from './DropZone.styles';

export interface DropZoneProps {
  onFilesAccepted: (files: File[]) => void;
  onFilesRejected?: (rejections: FileRejection[]) => void;
  accept?: Accept;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
}

const DEFAULT_ACCEPT: Accept = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  'audio/*': ['.mp3', '.wav', '.ogg'],
  'video/*': ['.mp4', '.webm'],
};

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export const DropZone = ({
  onFilesAccepted,
  onFilesRejected,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE,
  maxFiles = 10,
  disabled = false,
}: DropZoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (acceptedFiles.length > 0) {
        onFilesAccepted(acceptedFiles);
      }
      if (rejectedFiles.length > 0) {
        onFilesRejected?.(rejectedFiles);
      }
    },
    [onFilesAccepted, onFilesRejected],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles,
    disabled,
    multiple: maxFiles > 1,
  });

  return (
    <S.Container {...getRootProps()} $isDragActive={isDragActive} $isDragReject={isDragReject} $disabled={disabled}>
      <input {...getInputProps()} />

      <Stack alignItems="center" gap={2}>
        <CloudArrowUpIcon
          size={48}
          weight={isDragActive ? 'fill' : 'duotone'}
          color={isDragActive ? 'inherit' : undefined}
        />

        <Stack alignItems="center" gap={1}>
          <Typography variant="body1" fontWeight={500}>
            {isDragActive
              ? isDragReject
                ? 'Some files are not supported'
                : 'Drop files here'
              : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to browse
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Max file size: {Math.round(maxSize / (1024 * 1024))}MB
        </Typography>
      </Stack>
    </S.Container>
  );
};
