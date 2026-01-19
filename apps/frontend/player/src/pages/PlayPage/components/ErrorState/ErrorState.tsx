import { Typography, Button, Stack } from '@mui/material';
import { WarningCircleIcon } from '@phosphor-icons/react';
import * as S from './ErrorState.styles';

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export const ErrorState = ({ title, description, onRetry }: ErrorStateProps) => {
  return (
    <S.Container>
      <S.Card>
        <Stack alignItems="center" gap={2}>
          <WarningCircleIcon size={48} weight="duotone" />
          <Typography variant="h5">{title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          {onRetry && (
            <Button variant="outlined" onClick={onRetry} sx={{ mt: 1 }}>
              Try Again
            </Button>
          )}
        </Stack>
      </S.Card>
    </S.Container>
  );
};
