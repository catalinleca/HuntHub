import { Button, Divider, Stack, Typography } from '@mui/material';
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import hedgehuntLogo from '@/assets/hedgehunt-logo.svg';
import * as S from './CompletedView.styles';

export const LogoSection = () => (
  <S.LogoWrap>
    <S.SparkleRing />
    <S.LogoCircle>
      <S.Logo src={hedgehuntLogo} alt="HedgeHunt" />
    </S.LogoCircle>
  </S.LogoWrap>
);

export const TitleSection = () => (
  <>
    <Typography variant="displayH4">Hunt Complete!</Typography>
    <Typography variant="displayBody2" color="text.secondary">
      You conquered the adventure!
    </Typography>
  </>
);

interface SummarySectionProps {
  totalSteps: number;
  time: string;
  huntName: string;
}

export const SummarySection = ({ totalSteps, time, huntName }: SummarySectionProps) => (
  <S.SummaryCard>
    <Stack gap={3}>
      <Typography variant="displayH6">{huntName}</Typography>
      <Divider />
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack flex={1} alignItems="center" gap={1}>
          <Typography variant="h5" color="primary.main">
            {totalSteps}/{totalSteps}
          </Typography>
          <Typography variant="label" color="text.secondary">
            Challenges
          </Typography>
        </Stack>
        <Divider orientation="vertical" flexItem sx={{ mx: 6 }} />
        <Stack flex={1} alignItems="center" gap={1}>
          <Typography variant="h5" color="primary.main">
            {time}
          </Typography>
          <Typography variant="label" color="text.secondary">
            Time
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  </S.SummaryCard>
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
