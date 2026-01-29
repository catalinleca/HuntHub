import { useHuntMeta, useSessionId, useSessionActions } from '@/context';
import { useGetSession } from '@/api';
import { formatDuration } from '@/utils';
import { useConfetti } from './useConfetti';
import { LogoSection, TitleSection, SummarySection, FooterSection } from './CompletedView.sections';
import * as S from './CompletedView.styles';

export const CompletedView = () => {
  const sessionId = useSessionId();
  const { data: session } = useGetSession(sessionId);
  const huntMeta = useHuntMeta();
  const { abandonSession } = useSessionActions();

  useConfetti();

  const totalSteps = huntMeta?.totalSteps ?? 0;
  const huntName = huntMeta?.name ?? 'the hunt';
  const duration = formatDuration(session?.startedAt ?? null, session?.completedAt ?? null);

  return (
    <S.Container>
      <LogoSection />
      <TitleSection />
      <SummarySection totalSteps={totalSteps} time={duration} huntName={huntName} />
      <FooterSection onPlayAgain={abandonSession} />
    </S.Container>
  );
};
