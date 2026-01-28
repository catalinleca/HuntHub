import { Stack } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { LoginHeader, PromptPreview, AuthActions, TermsFooter } from './components';
import * as S from './LoginPage.styles';

export const LoginPage = () => {
  const { signInWithGoogle, error, isSigningIn } = useAuth();
  const pendingPrompt = sessionStorage.getItem('pendingPrompt');

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <S.PageContainer alignItems="center" justifyContent="center">
      <S.Card elevation={4}>
        <Stack alignItems="center" gap={5}>
          <LoginHeader />
          {pendingPrompt && <PromptPreview prompt={pendingPrompt} />}
          <AuthActions onGoogleSignIn={handleGoogleSignIn} isLoading={isSigningIn} error={error} />
          <TermsFooter />
        </Stack>
      </S.Card>
    </S.PageContainer>
  );
};
