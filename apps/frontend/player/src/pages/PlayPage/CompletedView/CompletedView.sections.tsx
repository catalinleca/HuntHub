import { Typography, Button, Divider } from '@mui/material';
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import hedgehuntLogo from '@/assets/hedgehunt-logo.svg';
import * as S from './CompletedView.styles';

export const LogoSection = () => (
  <S.LogoCircle>
    <S.Logo src={hedgehuntLogo} alt="HedgeHunt" />
  </S.LogoCircle>
);

export const TitleSection = () => (
  <>
    <Typography variant="displayH4">Hunt Complete!</Typography>
    <Typography color="text.secondary">You conquered the adventure!</Typography>
  </>
);

interface StatsSectionProps {
  totalSteps: number;
  time: string;
}

export const StatsSection = ({ totalSteps, time }: StatsSectionProps) => (
  <S.StatsCard elevation={0}>
    <S.StatItem>
      <Typography variant="h5" color="primary.main">
        {totalSteps}/{totalSteps}
      </Typography>
      <Typography variant="xsRegular" color="text.secondary">
        CHALLENGES
      </Typography>
    </S.StatItem>
    <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
    <S.StatItem>
      <Typography variant="h5" color="primary.main">
        {time}
      </Typography>
      <Typography variant="xsRegular" color="text.secondary">
        TIME
      </Typography>
    </S.StatItem>
  </S.StatsCard>
);

interface CompletionSectionProps {
  huntName: string;
}

export const CompletionSection = ({ huntName }: CompletionSectionProps) => (
  <S.CompletionCard>
    <Typography variant="body2" color="text.secondary">
      You completed
    </Typography>
    <Typography variant="h6">{huntName}</Typography>
  </S.CompletionCard>
);

interface FooterSectionProps {
  onPlayAgain: () => void;
}

export const FooterSection = ({ onPlayAgain }: FooterSectionProps) => (
  <S.Footer>
    <Button fullWidth variant="outlined" startIcon={<ArrowCounterClockwiseIcon />} onClick={onPlayAgain}>
      Play Again
    </Button>
  </S.Footer>
);
