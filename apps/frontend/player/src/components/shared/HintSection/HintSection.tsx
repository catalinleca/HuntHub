import { useState } from 'react';
import { Typography } from '@mui/material';
import { LightbulbIcon } from '@phosphor-icons/react';
import * as S from './HintSection.styles';

interface HintSectionProps {
  hint: string;
}

export const HintSection = ({ hint }: HintSectionProps) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  if (!isRevealed) {
    return (
      <S.HintButton onClick={handleReveal}>
        <LightbulbIcon size={20} weight="duotone" />
        <Typography variant="body2">Need a hint?</Typography>
      </S.HintButton>
    );
  }

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
};
