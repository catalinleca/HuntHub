import { useHuntMeta, useSessionActions, useSessionTimestamps } from '@/context';
import { formatDuration } from '@/utils';
import { useConfetti } from './useConfetti';
import { LogoSection, TitleSection, SummarySection, FooterSection } from './CompletedView.sections';
import * as S from './CompletedView.styles';

export const CompletedView = () => {
  const huntMeta = useHuntMeta();
  const { startedAt, completedAt } = useSessionTimestamps();
  const { abandonSession } = useSessionActions();

  useConfetti();

  const totalSteps = huntMeta?.totalSteps ?? 0;
  const huntName = huntMeta?.name ?? 'the hunt';
  const duration = formatDuration(startedAt, completedAt);

  return (
    <S.Container>
      <LogoSection />
      <TitleSection />
      <SummarySection totalSteps={totalSteps} time={duration} huntName={huntName} />
      <FooterSection onPlayAgain={abandonSession} />
    </S.Container>
  );
};
