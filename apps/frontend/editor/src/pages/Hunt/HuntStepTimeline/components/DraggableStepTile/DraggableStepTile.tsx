import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StepTile, StepTileProps } from '../StepTile';

type DraggableStepTileProps = Omit<StepTileProps, 'ref' | 'style'>;

const HOVER_LIFT = -2;

export const DraggableStepTile = ({ onMouseEnter, onMouseLeave, ...props }: DraggableStepTileProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.formKey,
  });

  const shouldLift = isHovered && !isDragging;

  const style: React.CSSProperties = {
    transform: transform
      ? CSS.Transform.toString({ ...transform, y: transform.y + (shouldLift ? HOVER_LIFT : 0) })
      : shouldLift
        ? `translateY(${HOVER_LIFT}px)`
        : undefined,
    transition: `transform 0.2s ease-out${transition ? `, ${transition}` : ''}`,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave?.();
  };

  return (
    <StepTile
      ref={setNodeRef}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...attributes}
      {...listeners}
      {...props}
    />
  );
};
