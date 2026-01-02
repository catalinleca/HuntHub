import { ChallengeType } from '@hunthub/shared';
import type { ChallengeFormData } from '@/types/editor';
import { ScrollableContainer, SortableStepList, AddStepIcon } from './components';
import * as S from './HuntStepTimeline.styles';

interface TimelineStep {
  formKey: string;
  type: ChallengeType;
  challenge: ChallengeFormData;
}

interface HuntStepTimelineProps {
  steps: TimelineStep[];
  selectedFormKey: string | null;
  onSelectStep: (formKey: string) => void;
  onAddStep: (type: ChallengeType) => void;
  onMoveStep: (oldIndex: number, newIndex: number) => void;
}

export const HuntStepTimeline = ({
  steps,
  selectedFormKey,
  onSelectStep,
  onAddStep,
  onMoveStep,
}: HuntStepTimelineProps) => {
  const scrollToSelector = selectedFormKey ? `[data-form-key="${selectedFormKey}"]` : undefined;

  return (
    <S.Wrapper>
      <S.InnerWrapper>
        <ScrollableContainer scrollToSelector={scrollToSelector}>
          <SortableStepList
            steps={steps}
            selectedFormKey={selectedFormKey}
            onSelectStep={onSelectStep}
            onMoveStep={onMoveStep}
          />
        </ScrollableContainer>

        <AddStepIcon onAddStep={onAddStep} />
      </S.InnerWrapper>
    </S.Wrapper>
  );
};
