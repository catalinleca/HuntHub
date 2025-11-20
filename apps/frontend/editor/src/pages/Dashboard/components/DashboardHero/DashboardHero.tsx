import { CompassIcon, ScrollIcon, SwordIcon } from '@phosphor-icons/react';
import * as S from './DashboardHero.styles';

interface DashboardHeroProps {
  onCreateClick: () => void;
}

export const DashboardHero = ({ onCreateClick }: DashboardHeroProps) => {
  return (
    <S.HeroContainer>
      <S.HeroContent>
        <S.CompassCircle>
          <CompassIcon size={52} />
        </S.CompassCircle>

        <S.HeroTitle variant="h1">YOUR QUEST AWAITS</S.HeroTitle>

        <S.HeroSubtitle variant="body1" fontWeight={500}>
          Forge legendary treasure hunts that transform ordinary places into extraordinary adventures
        </S.HeroSubtitle>

        <S.DottedPath>
          {Array.from({ length: 15 }).map((_, i) => (
            <S.Dot key={i} />
          ))}
        </S.DottedPath>

        <S.ButtonContainer>
          <S.PrimaryHeroButton startIcon={<SwordIcon size={20} />} onClick={onCreateClick}>
            Forge New Quest
          </S.PrimaryHeroButton>

          <S.SecondaryHeroButton startIcon={<ScrollIcon size={20} />}>View Quest Log</S.SecondaryHeroButton>
        </S.ButtonContainer>
      </S.HeroContent>
    </S.HeroContainer>
  );
};
