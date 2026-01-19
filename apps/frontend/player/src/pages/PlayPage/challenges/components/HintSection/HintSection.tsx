import { useState } from 'react';
import { Typography, CircularProgress } from '@mui/material';
import { LightbulbIcon } from '@phosphor-icons/react';
import { useSessionId, usePreviewHint } from '@/context';
import { useHint } from '@/api/play';
import * as S from './HintSection.styles';

const HintDisplay = ({ hint }: { hint: string }) => (
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

export const HintSection = () => {
  const sessionId = useSessionId();
  const previewHint = usePreviewHint();
  const { requestHint, hint, isLoading, isError } = useHint();
  const [revealedHint, setRevealedHint] = useState<string | undefined>(undefined);

  const isPreviewMode = !sessionId && previewHint !== undefined;
  const shouldShowPreviewHint = isPreviewMode && revealedHint === previewHint && previewHint;

  if (shouldShowPreviewHint) {
    return <HintDisplay hint={previewHint} />;
  }

  if (hint) {
    return <HintDisplay hint={hint} />;
  }

  if (isError) {
    return (
      <S.HintButton disabled>
        <LightbulbIcon size={20} weight="duotone" />
        <Typography variant="body2">No hint available</Typography>
      </S.HintButton>
    );
  }

  if (isPreviewMode) {
    return (
      <S.HintButton onClick={() => setRevealedHint(previewHint)} disabled={!previewHint}>
        <LightbulbIcon size={20} weight="duotone" />
        <Typography variant="body2">{previewHint ? 'Need a hint?' : 'No hint available'}</Typography>
      </S.HintButton>
    );
  }

  return (
    <S.HintButton onClick={() => sessionId && requestHint({ sessionId })} disabled={isLoading || !sessionId}>
      {isLoading ? <CircularProgress size={16} /> : <LightbulbIcon size={20} weight="duotone" />}
      <Typography variant="body2">{isLoading ? 'Loading...' : 'Need a hint?'}</Typography>
    </S.HintButton>
  );
};
