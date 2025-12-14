import { Stack, Typography, LinearProgress, IconButton, Box } from '@mui/material';
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

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

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

const getStatusColor = (status: UploadStatus) => {
  switch (status) {
    case 'success':
      return 'success.main';
    case 'error':
      return 'error.main';
    default:
      return 'primary.main';
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
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        border: '1px solid',
        borderColor: file.status === 'error' ? 'error.light' : 'divider',
        bgcolor: file.status === 'error' ? 'error.lighter' : 'background.paper',
      }}
    >
      <Stack direction="row" alignItems="center" gap={2}>
        {/* File icon */}
        <Box sx={{ color: getStatusColor(file.status) }}>{getFileIcon(file.type)}</Box>

        {/* File info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" noWrap fontWeight={500}>
              {file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFileSize(file.size)}
            </Typography>
          </Stack>

          {/* Progress bar */}
          {file.status === 'uploading' && (
            <Stack direction="row" alignItems="center" gap={1} mt={1}>
              <LinearProgress
                variant="determinate"
                value={file.progress}
                sx={{ flex: 1, height: 6, borderRadius: 3 }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32 }}>
                {file.progress}%
              </Typography>
            </Stack>
          )}

          {/* Error message */}
          {file.status === 'error' && file.error && (
            <Typography variant="caption" color="error.main" mt={1}>
              {file.error}
            </Typography>
          )}
        </Box>

        {/* Status icon or actions */}
        <Stack direction="row" alignItems="center" gap={1}>
          {file.status === 'success' && (
            <CheckCircleIcon size={20} weight="fill" color="var(--mui-palette-success-main)" />
          )}

          {file.status === 'error' && (
            <>
              <WarningCircleIcon size={20} weight="fill" color="var(--mui-palette-error-main)" />
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
    </Box>
  );
};
