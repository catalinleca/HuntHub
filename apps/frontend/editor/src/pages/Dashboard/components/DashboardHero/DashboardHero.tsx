import { GenerateHuntStyle } from '@hunthub/shared';
import { PromptInput } from './PromptInput';
import { StyleSelector } from './StyleSelector';
import * as S from './DashboardHero.styles';

interface DashboardHeroProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  style: GenerateHuntStyle | undefined;
  onStyleChange: (style: GenerateHuntStyle | null) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export const DashboardHero = ({
  prompt,
  onPromptChange,
  style,
  onStyleChange,
  onGenerate,
  isGenerating,
}: DashboardHeroProps) => (
  <S.HeroContainer>
    <S.HeroContent>
      <PromptInput value={prompt} onChange={onPromptChange} onSubmit={onGenerate} isLoading={isGenerating} />
      <StyleSelector value={style} onChange={onStyleChange} disabled={isGenerating} />
    </S.HeroContent>
  </S.HeroContainer>
);
