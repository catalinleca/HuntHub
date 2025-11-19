import { Typography } from '@mui/material';
import { EmptyStateContainer } from '../Dashboard.styles';

export const ErrorState = () => {
  return (
    <EmptyStateContainer>
      <Typography variant="h4" gutterBottom color="text.secondary">
        Big error
      </Typography>
    </EmptyStateContainer>
  );
};
