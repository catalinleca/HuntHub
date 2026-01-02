import { Fragment, useRef, useState, useCallback, useEffect } from 'react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { ChallengeType } from '@hunthub/shared';
import type { ChallengeFormData } from '@/types/editor';
import { DraggableStepTile, AddStepIcon } from './components';
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const stepIds = steps.map((s) => s.formKey);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = stepIds.indexOf(active.id as string);
    const newIndex = stepIds.indexOf(over.id as string);
    onMoveStep(oldIndex, newIndex);
  };

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

    return () => observer.disconnect();
  }, [updateScrollState]);

  useEffect(() => {
    updateScrollState();
  }, [updateScrollState, steps.length]);

  useEffect(() => {
    if (selectedFormKey && scrollRef.current) {
      const container = scrollRef.current;
      const el = container.querySelector(`[data-form-key="${selectedFormKey}"]`) as HTMLElement;

      if (el) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const isVisible = elRect.left >= containerRect.left && elRect.right <= containerRect.right;

        if (!isVisible) {
          el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }
  }, [selectedFormKey]);

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
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={stepIds} strategy={horizontalListSortingStrategy}>
              {steps.map((step, index) => (
                <Fragment key={step.formKey}>
                  <DraggableStepTile
                    formKey={step.formKey}
                    stepNumber={index + 1}
                    type={step.type}
                    challenge={step.challenge}
                    isSelected={selectedFormKey === step.formKey}
                    onClick={() => onSelectStep(step.formKey)}
                  />
                  {index < steps.length - 1 && <S.Connector />}
                </Fragment>
              ))}
            </SortableContext>
          </DndContext>
        </S.Container>

        <S.ScrollButton $visible={canScrollRight} onClick={() => scroll('right')}>
          <CaretRightIcon size={20} weight="bold" />
        </S.ScrollButton>

        <AddStepIcon onAddStep={onAddStep} />
      </S.InnerWrapper>
    </S.Wrapper>
  );
};
