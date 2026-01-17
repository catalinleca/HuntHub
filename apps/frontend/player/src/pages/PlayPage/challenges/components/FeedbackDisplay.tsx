import { Alert, styled, alpha } from '@mui/material';

interface FeedbackDisplayProps {
  feedback: string | null;
  variant?: 'info' | 'success' | 'error' | 'warning';
}

const StyledAlert = styled(Alert)(({ theme, severity }) => ({
  borderRadius: theme.shape.md,
  ...(severity === 'info' && {
    backgroundColor: alpha(theme.palette.accent.main, 0.1),
    border: `1px solid ${alpha(theme.palette.accent.main, 0.2)}`,
    color: theme.palette.text.primary,
    '& .MuiAlert-icon': {
      color: theme.palette.accent.dark,
    },
  }),
}));

export const FeedbackDisplay = ({ feedback, variant = 'info' }: FeedbackDisplayProps) => {
  if (!feedback) {
    return null;
  }

  return <StyledAlert severity={variant}>{feedback}</StyledAlert>;
};
