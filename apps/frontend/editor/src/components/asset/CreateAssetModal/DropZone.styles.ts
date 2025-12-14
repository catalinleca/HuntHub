import { styled, alpha } from '@mui/material/styles';
import { Box } from '@mui/material';

interface DropZoneContainerProps {
  $isDragActive?: boolean;
  $isDragReject?: boolean;
  $disabled?: boolean;
}

export const Container = styled(Box, {
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
