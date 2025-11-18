import { Typography } from '@mui/material';
import { EmptyStateContainer } from '../Dashboard.styles';

export function ErrorState() {
  return (
    <EmptyStateContainer>
      <Typography variant="h6" gutterBottom color="text.secondary">
        Backend not running
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Start the backend API: <code>npm run dev:backend</code>
      </Typography>
    </EmptyStateContainer>
  );
}
