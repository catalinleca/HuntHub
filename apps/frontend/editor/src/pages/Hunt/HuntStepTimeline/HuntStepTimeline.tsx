import { ReactNode } from 'react';
import { useHuntStepsContext } from '@/pages/Hunt/context';
import { ScrollableContainer, SortableStepList, AddStepIcon } from './components';
import * as S from './HuntStepTimeline.styles';

interface HuntStepTimelineProps {
  actions?: ReactNode;
}

export const HuntStepTimeline = ({ actions }: HuntStepTimelineProps) => {
  const { steps, selectedFormKey, setSelectedFormKey, handleCreateStep, handleMoveStep } = useHuntStepsContext();

  const scrollToSelector = selectedFormKey ? `[data-form-key="${selectedFormKey}"]` : undefined;

  return (
    <S.Wrapper>
      <S.InnerWrapper>
        <ScrollableContainer scrollToSelector={scrollToSelector}>
          <SortableStepList
            steps={steps}
            selectedFormKey={selectedFormKey}
            onSelectStep={setSelectedFormKey}
            onMoveStep={handleMoveStep}
          />
        </ScrollableContainer>
        <AddStepIcon onAddStep={handleCreateStep} />
      </S.InnerWrapper>
      {actions && <S.ActionsContainer>{actions}</S.ActionsContainer>}
    </S.Wrapper>
  );
};
