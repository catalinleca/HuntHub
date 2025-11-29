import { useMemo } from 'react';
import { Button, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PlusIcon } from '@phosphor-icons/react';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableOptionItem } from '../OptionItem/SortableOptionItem';
import { useMultipleChoiceOptions } from './useMultipleChoiceOptions';

interface MultipleChoiceEditorProps {
  stepIndex: number;
}

const pointerSensorOptions = { activationConstraint: { distance: 5 } };

export const MultipleChoiceEditor = ({ stepIndex }: MultipleChoiceEditorProps) => {
  const { fields, arrayActions, optionsPath, targetId, handleMarkTarget, handleRemove, handleAdd, canAdd, canRemove } =
    useMultipleChoiceOptions(stepIndex);

  const sensors = useSensors(useSensor(PointerSensor, pointerSensorOptions));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);

    arrayActions.move(oldIndex, newIndex);
  };

  const itemIds = useMemo(() => fields.map((f) => f.id), [fields]);

  return (
    <Stack spacing={1}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {fields.map((item, index) => (
            <SortableOptionItem
              key={item._id}
              id={item.id}
              index={index}
              isTarget={item.id === targetId}
              fieldPath={`${optionsPath}.${index}`}
              onMarkTarget={() => handleMarkTarget(item.id)}
              onRemove={() => handleRemove(index)}
              canRemove={canRemove}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        onClick={handleAdd}
        disabled={!canAdd}
        startIcon={<PlusIcon size={16} weight="bold" />}
        size="small"
        sx={(theme) => ({
          alignSelf: 'flex-start',
          backgroundColor: alpha(theme.palette.success.main, 0.15),
          color: 'success.main',
          '&:hover': {
            backgroundColor: alpha(theme.palette.success.main, 0.25),
          },
        })}
      >
        Add Option
      </Button>
    </Stack>
  );
};
