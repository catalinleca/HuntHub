import { Stack, Typography, IconButton, Box } from '@mui/material';
import {
  FileIcon,
  ImageIcon,
  WaveformIcon,
  VideoIcon,
  CheckCircleIcon,
  WarningCircleIcon,
  XIcon,
  ArrowClockwiseIcon,
} from '@phosphor-icons/react';
import { getColor, prettyBytes } from '@/utils';
import * as S from './CreateAssetModal.styles';

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface UploadingFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}

export interface UploadProgressProps {
  files: UploadingFile[];
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) {
    return <ImageIcon size={20} weight="duotone" />;
  }
  if (type.startsWith('audio/')) {
    return <WaveformIcon size={20} weight="duotone" />;
  }
  if (type.startsWith('video/')) {
    return <VideoIcon size={20} weight="duotone" />;
  }
  return <FileIcon size={20} weight="duotone" />;
};

const getStatusColor = (status: UploadStatus): string => {
  switch (status) {
    case 'success':
      return getColor('success.main');
    case 'error':
      return getColor('error.main');
    default:
      return getColor('primary.main');
  }
};

export const UploadProgress = ({ files, onRemove, onRetry }: UploadProgressProps) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <Stack gap={1}>
      {files.map((file) => (
        <UploadFileItem
          key={file.id}
          file={file}
          onRemove={onRemove ? () => onRemove(file.id) : undefined}
          onRetry={onRetry ? () => onRetry(file.id) : undefined}
        />
      ))}
    </Stack>
  );
};

interface UploadFileItemProps {
  file: UploadingFile;
  onRemove?: () => void;
  onRetry?: () => void;
}

const UploadFileItem = ({ file, onRemove, onRetry }: UploadFileItemProps) => {
  const statusColor = getStatusColor(file.status);

  return (
    <S.FileItem $hasError={file.status === 'error'}>
      <Stack direction="row" alignItems="center" gap={2}>
        <Box sx={{ color: statusColor }}>{getFileIcon(file.type)}</Box>

        <S.FileContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" noWrap fontWeight={500}>
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {prettyBytes(file.size)}
            </Typography>
          </Stack>

          {file.status === 'uploading' && (
            <Stack direction="row" alignItems="center" gap={1} mt={1}>
              <S.ProgressBar variant="determinate" value={file.progress} />
              <Typography variant="caption" color="text.secondary">
                <S.ProgressText>{file.progress}%</S.ProgressText>
              </Typography>
            </Stack>
          )}

          {file.status === 'error' && file.error && (
            <Typography variant="caption" color="error.main" mt={1}>
              {file.error}
            </Typography>
          )}
        </S.FileContent>

        <Stack direction="row" alignItems="center" gap={1}>
          {file.status === 'success' && <CheckCircleIcon size={20} weight="fill" color={getColor('success.main')} />}

          {file.status === 'error' && (
            <>
              <WarningCircleIcon size={20} weight="fill" color={getColor('error.main')} />
              {onRetry && (
                <IconButton size="small" onClick={onRetry} title="Retry">
                  <ArrowClockwiseIcon size={16} />
                </IconButton>
              )}
            </>
          )}

          {(file.status === 'pending' || file.status === 'error') && onRemove && (
            <IconButton size="small" onClick={onRemove} title="Remove">
              <XIcon size={16} />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </S.FileItem>
  );
};
