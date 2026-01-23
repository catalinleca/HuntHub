import { Stack, Alert, Typography, Link } from '@mui/material';
import { GoogleLogoIcon, ArrowRightIcon } from '@phosphor-icons/react';
import { getColor } from '@hunthub/compass';
import * as S from '../LoginPage.styles';

interface AuthActionsProps {
  onGoogleSignIn: () => void;
  isLoading: boolean;
  error: string | null;
}

export const AuthActions = ({ onGoogleSignIn, isLoading, error }: AuthActionsProps) => (
  <Stack gap={3} sx={{ width: '100%' }}>
    <S.GoogleButton
      variant="contained"
      size="large"
      fullWidth
      onClick={onGoogleSignIn}
      disabled={isLoading}
      startIcon={<GoogleLogoIcon size={20} weight="bold" />}
    >
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </S.GoogleButton>

    {error && <Alert severity="error">{error}</Alert>}

    <S.Divider direction="row" alignItems="center" gap={2}>
      <Typography variant="smRegular" color="text.secondary">
        or
      </Typography>
    </S.Divider>

    <Stack direction="row" justifyContent="center" alignItems="center" gap={1}>
      <Link component="button" variant="body2" color="primary.main" underline="none">
        Continue with email
      </Link>
      <ArrowRightIcon size={16} color={getColor('primary.main')} />
    </Stack>
  </Stack>
);
