import { styled, alpha } from '@mui/material/styles';
import { Box, LinearProgress as MuiLinearProgress } from '@mui/material';

// ─────────────────────────────────────────────────────────────────────────────
// DropZone
// ─────────────────────────────────────────────────────────────────────────────

interface DropZoneContainerProps {
  $isDragActive?: boolean;
  $isDragReject?: boolean;
  $disabled?: boolean;
}

export const DropZoneContainer = styled(Box, {
  shouldForwardProp: (prop) => !['$isDragActive', '$isDragReject', '$disabled'].includes(prop as string),
})<DropZoneContainerProps>(({ theme, $isDragActive, $isDragReject, $disabled }) => {
  const getBorderColor = () => {
    if ($isDragReject) return theme.palette.error.main;
    if ($isDragActive) return theme.palette.primary.main;
    return theme.palette.divider;
  };

  const getBgColor = () => {
    if ($isDragReject) return alpha(theme.palette.error.main, 0.08);
    if ($isDragActive) return alpha(theme.palette.primary.main, 0.08);
    return theme.palette.action.hover;
  };

  return {
    border: '2px dashed',
    borderColor: getBorderColor(),
    borderRadius: theme.shape.borderRadius * 2,
    backgroundColor: getBgColor(),
    cursor: $disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: $disabled ? 0.5 : 1,
    padding: theme.spacing(4),
  };
});

// ─────────────────────────────────────────────────────────────────────────────
// UploadProgress
// ─────────────────────────────────────────────────────────────────────────────

export const FileItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== '$hasError',
})<{ $hasError?: boolean }>(({ theme, $hasError }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${$hasError ? theme.palette.error.light : theme.palette.divider}`,
  backgroundColor: $hasError ? alpha(theme.palette.error.main, 0.08) : theme.palette.background.paper,
}));

export const FileContent = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const ProgressBar = styled(MuiLinearProgress)({
  flex: 1,
  height: 6,
  borderRadius: 3,
});

export const ProgressText = styled('span')({
  minWidth: 32,
});
