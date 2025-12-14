import { styled, alpha } from '@mui/material/styles';
import { Box, LinearProgress as MuiLinearProgress } from '@mui/material';

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

export const ProgressBar = styled(MuiLinearProgress)(({ theme }) => ({
  flex: 1,
  height: 6,
  borderRadius: 3,
}));

export const ProgressText = styled('span')({
  minWidth: 32,
});
