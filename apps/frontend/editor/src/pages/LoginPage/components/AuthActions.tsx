import { Stack, Button, Alert, Typography } from '@mui/material';
import * as S from '../LoginPage.styles';

interface AuthActionsProps {
  onGoogleSignIn: () => void;
  isLoading: boolean;
  error: string | null;
}

export const AuthActions = ({ onGoogleSignIn, isLoading, error }: AuthActionsProps) => (
  <Stack gap={3} sx={{ width: '100%' }}>
    <Button variant="contained" size="large" fullWidth onClick={onGoogleSignIn} disabled={isLoading}>
      {isLoading ? 'Signing in...' : 'Continue with Google'}
    </Button>

    {error && <Alert severity="error">{error}</Alert>}

    <S.Divider direction="row" alignItems="center" gap={2}>
      <Typography variant="smRegular" color="text.secondary">
        or
      </Typography>
    </S.Divider>

    <Typography variant="smRegular" color="text.secondary" textAlign="center">
      Continue with email →
    </Typography>
  </Stack>
);
