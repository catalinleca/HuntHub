import { Fragment, useRef, useState, useCallback, useEffect } from 'react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    el.scrollBy({ left: direction === 'left' ? -120 : 120, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);
    updateScrollState();

    return () => observer.disconnect();
  }, [updateScrollState, steps.length]);

  return (
    <S.Wrapper>
      <S.InnerWrapper>
        <S.ScrollButton $visible={canScrollLeft} onClick={() => scroll('left')}>
          <CaretLeftIcon size={20} weight="bold" />
        </S.ScrollButton>

        <S.Container
          ref={scrollRef}
          onScroll={updateScrollState}
          $canScrollLeft={canScrollLeft}
          $canScrollRight={canScrollRight}
        >
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
        </S.Container>

        <S.ScrollButton $visible={canScrollRight} onClick={() => scroll('right')}>
          <CaretRightIcon size={20} weight="bold" />
        </S.ScrollButton>

        <AddStepIcon onAddStep={onAddStep} />
      </S.InnerWrapper>
    </S.Wrapper>
  );
};
