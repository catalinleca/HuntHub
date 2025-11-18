import { Typography, Button } from '@mui/material';
import { PlusIcon } from '@phosphor-icons/react';
import { EmptyStateContainer, EmptyStateDescription } from '../Dashboard.styles';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <EmptyStateContainer>
      <Typography variant="h5" gutterBottom>
        No hunts yet
      </Typography>
      <EmptyStateDescription variant="body1" color="text.secondary">
        Create your first treasure hunt to get started!
      </EmptyStateDescription>
      <Button
        variant="contained"
        size="large"
        startIcon={<PlusIcon size={20} />}
        onClick={onCreateClick}
      >
        Create Your First Hunt
      </Button>
    </EmptyStateContainer>
  );
}