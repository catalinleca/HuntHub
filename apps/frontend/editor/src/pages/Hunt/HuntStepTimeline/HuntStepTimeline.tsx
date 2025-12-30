import { StepIcon, AddStepIcon } from './components';
import { ChallengeType } from '@hunthub/shared';
import * as S from './HuntStepTimeline.styles';

interface TimelineStep {
  formKey: string;
  type: ChallengeType;
}

interface HuntStepTimelineProps {
  steps: TimelineStep[];
  selectedFormKey: string | null;
  onSelectStep: (formKey: string) => void;
  onAddStep: (type: ChallengeType) => void;
}

export const HuntStepTimeline = ({ steps, selectedFormKey, onSelectStep, onAddStep }: HuntStepTimelineProps) => {
  return (
    <S.Container>
      {steps.map((step, index) => (
        <StepIcon
          key={step.formKey}
          stepNumber={index + 1}
          type={step.type}
          isSelected={selectedFormKey === step.formKey}
          onClick={() => onSelectStep(step.formKey)}
        />
      ))}
      <AddStepIcon onAddStep={onAddStep} />
    </S.Container>
  );
};
