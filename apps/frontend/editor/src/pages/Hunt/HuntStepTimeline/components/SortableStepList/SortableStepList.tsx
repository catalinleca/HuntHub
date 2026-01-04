import { Fragment, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ChallengeType, Challenge } from '@hunthub/shared';
import { StepTile } from '../StepTile';
import { DraggableStepTile } from '../DraggableStepTile';
import { Connector } from '../Connector';

interface TimelineStep {
  formKey: string;
  type: ChallengeType;
  challenge: Challenge;
}

interface SortableStepListProps {
  steps: TimelineStep[];
  selectedFormKey: string | null;
  onSelectStep: (formKey: string) => void;
  onMoveStep: (oldIndex: number, newIndex: number) => void;
}

export const SortableStepList = ({ steps, selectedFormKey, onSelectStep, onMoveStep }: SortableStepListProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const stepIds = steps.map((s) => s.formKey);
  const activeStep = activeId ? steps.find((s) => s.formKey === activeId) : null;
  const activeIndex = activeId ? steps.findIndex((s) => s.formKey === activeId) : -1;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = stepIds.indexOf(active.id as string);
    const newIndex = stepIds.indexOf(over.id as string);
    onMoveStep(oldIndex, newIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
            {index < steps.length - 1 && <Connector />}
          </Fragment>
        ))}
      </SortableContext>
      <DragOverlay>
        {activeStep && (
          <StepTile
            formKey={activeStep.formKey}
            stepNumber={activeIndex + 1}
            type={activeStep.type}
            challenge={activeStep.challenge}
            isSelected={selectedFormKey === activeStep.formKey}
            onClick={() => {}}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};
