import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { OptionItem, OptionItemProps } from './OptionItem';

interface SortableOptionItemProps extends Omit<OptionItemProps, 'style' | 'dragHandleProps'> {
  id: string;
}

export const SortableOptionItem = ({ id, ...props }: SortableOptionItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return <OptionItem ref={setNodeRef} style={style} dragHandleProps={{ ...attributes, ...listeners }} {...props} />;
};
