import { Fragment } from 'react';
import { ChallengeType } from '@hunthub/shared';
import type { ChallengeFormData } from '@/types/editor';
import { StepTile, AddStepIcon } from './components';
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
}

export const HuntStepTimeline = ({ steps, selectedFormKey, onSelectStep, onAddStep }: HuntStepTimelineProps) => {
  return (
    <S.Container>
      {steps.map((step, index) => (
        <Fragment key={step.formKey}>
          <StepTile
            stepNumber={index + 1}
            type={step.type}
            challenge={step.challenge}
            isSelected={selectedFormKey === step.formKey}
            onClick={() => onSelectStep(step.formKey)}
          />
          {index < steps.length - 1 && <S.Connector />}
        </Fragment>
      ))}
      <AddStepIcon onAddStep={onAddStep} />
    </S.Container>
  );
};
