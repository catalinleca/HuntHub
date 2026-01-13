import { Alert } from '@mui/material';

interface FeedbackDisplayProps {
  feedback: string | null;
  variant?: 'info' | 'success' | 'error' | 'warning';
}

export const FeedbackDisplay = ({ feedback, variant = 'info' }: FeedbackDisplayProps) => {
  if (!feedback) {
    return null;
  }

  return <Alert severity={variant}>{feedback}</Alert>;
};
