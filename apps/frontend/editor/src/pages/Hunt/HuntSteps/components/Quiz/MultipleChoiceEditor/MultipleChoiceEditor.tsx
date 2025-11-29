import { Button, Stack } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PlusIcon } from '@phosphor-icons/react';
import { ArrayInput } from '@/components/form';
import { OptionItem } from '../OptionItem/OptionItem';
import { useMultipleChoiceOptions } from './useMultipleChoiceOptions';

interface MultipleChoiceEditorProps {
  stepIndex: number;
}

export const MultipleChoiceEditor = ({ stepIndex }: MultipleChoiceEditorProps) => {
  const { fields, arrayActions, optionsPath, targetId, handleMarkTarget, handleRemove, handleAdd, canAdd, canRemove } =
    useMultipleChoiceOptions(stepIndex);

  return (
    <Stack spacing={1}>
      <ArrayInput
        fields={fields}
        {...arrayActions}
        render={({ index, item }) => (
          <OptionItem
            index={index}
            isTarget={item.id === targetId}
            fieldPath={`${optionsPath}.${index}`}
            onMarkTarget={() => handleMarkTarget(item.id)}
            onRemove={() => handleRemove(index)}
            canRemove={canRemove}
          />
        )}
      />

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
