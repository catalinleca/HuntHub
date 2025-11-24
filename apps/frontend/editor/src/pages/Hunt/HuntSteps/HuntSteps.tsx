import { StepIcon, AddStepIcon } from './components';
import { ChallengeType } from '@hunthub/shared';
import * as S from './HuntSteps.styles';

interface Step {
  _id: string;
  type: ChallengeType;
}

interface HuntStepsProps {
  steps: Step[];
  selectedIndex: number;
  onSelectStep: (index: number) => void;
  onAddStep: (type: ChallengeType) => void;
}

export const HuntSteps = ({ steps, selectedIndex, onSelectStep, onAddStep }: HuntStepsProps) => {
  return (
    <S.Container>
      {steps.map((step, index) => (
        <StepIcon
          key={step._id}
          stepNumber={index + 1}
          type={step.type}
          isSelected={selectedIndex === index}
          onClick={() => onSelectStep(index)}
        />
      ))}
      <AddStepIcon onAddStep={onAddStep} />
    </S.Container>
  );
};
