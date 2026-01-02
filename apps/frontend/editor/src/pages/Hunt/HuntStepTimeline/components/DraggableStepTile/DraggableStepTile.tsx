import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StepTile, StepTileProps } from '../StepTile';

type DraggableStepTileProps = Omit<StepTileProps, 'ref' | 'style'>;

export const DraggableStepTile = (props: DraggableStepTileProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.formKey,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return <StepTile ref={setNodeRef} style={style} {...attributes} {...listeners} {...props} />;
};
