import { Stack, Typography, Button } from '@mui/material';
import { WarningCircleIcon, ArrowCounterClockwiseIcon, HouseIcon } from '@phosphor-icons/react';
import type { FallbackRender } from '@sentry/react';
import * as S from './ErrorFallback.styles';

export const ErrorFallback: FallbackRender = ({ resetError }) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <S.Container>
      <S.Content>
        <S.IconWrapper>
          <WarningCircleIcon size={64} weight="duotone" />
        </S.IconWrapper>

        <Typography variant="h4" component="h1">
          Something went wrong
        </Typography>

        <Typography variant="body1" color="text.secondary">
          We encountered an unexpected error. Our team has been notified.
        </Typography>

        <Stack direction="row" gap={2}>
          <Button
            variant="outlined"
            startIcon={<HouseIcon size={20} />}
            onClick={handleGoHome}
          >
            Go Home
          </Button>
          <Button
            variant="contained"
            startIcon={<ArrowCounterClockwiseIcon size={20} />}
            onClick={resetError}
          >
            Try Again
          </Button>
        </Stack>
      </S.Content>
    </S.Container>
  );
};
