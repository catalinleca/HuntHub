import { Typography, CircularProgress } from '@mui/material';
import { LightbulbIcon } from '@phosphor-icons/react';
import { usePlaySession } from '@/context';
import { useHint } from '@/api/play';
import * as S from './HintSection.styles';

export const HintSection = () => {
  const { sessionId } = usePlaySession();
  const { requestHint, hint, isLoading, isError } = useHint(sessionId);

  if (hint) {
    return (
      <S.HintContainer>
        <S.HintHeader>
          <LightbulbIcon size={20} weight="duotone" />
          <Typography variant="body2" fontWeight={600}>
            Hint
          </Typography>
        </S.HintHeader>
        <Typography variant="body2" color="text.secondary">
          {hint}
        </Typography>
      </S.HintContainer>
    );
  }

  if (isError) {
    return (
      <S.HintButton disabled>
        <LightbulbIcon size={20} weight="duotone" />
        <Typography variant="body2">No hint available</Typography>
      </S.HintButton>
    );
  }

  return (
    <S.HintButton onClick={() => requestHint()} disabled={isLoading}>
      {isLoading ? (
        <CircularProgress size={16} />
      ) : (
        <LightbulbIcon size={20} weight="duotone" />
      )}
      <Typography variant="body2">
        {isLoading ? 'Loading...' : 'Need a hint?'}
      </Typography>
    </S.HintButton>
  );
};
