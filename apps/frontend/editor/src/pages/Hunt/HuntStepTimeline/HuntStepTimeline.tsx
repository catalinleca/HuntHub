import { StepIcon, AddStepIcon } from './components';
import { ChallengeType } from '@hunthub/shared';
import * as S from './HuntStepTimeline.styles';

interface TimelineStep {
  _id: string;
  type: ChallengeType;
}

interface HuntStepTimelineProps {
  steps: TimelineStep[];
  selectedStepId: string | null;
  onSelectStep: (stepId: string) => void;
  onAddStep: (type: ChallengeType) => void;
}

export const HuntStepTimeline = ({ steps, selectedStepId, onSelectStep, onAddStep }: HuntStepTimelineProps) => {
  return (
    <S.Container>
      {steps.map((step, index) => (
        <StepIcon
          key={step._id}
          stepNumber={index + 1}
          type={step.type}
          isSelected={selectedStepId === step._id}
          onClick={() => onSelectStep(step._id)}
        />
      ))}
      <AddStepIcon onAddStep={onAddStep} />
    </S.Container>
  );
};
