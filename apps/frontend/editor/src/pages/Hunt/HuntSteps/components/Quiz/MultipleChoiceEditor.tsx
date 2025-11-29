import { Stack, Typography } from '@mui/material';
import { PlusIcon } from '@phosphor-icons/react';
import { ArrayInput } from '@/components/form';
import { OptionItem } from './OptionItem';
import { useMultipleChoiceOptions } from './useMultipleChoiceOptions';
import * as S from './MultipleChoiceEditor.styles';

interface MultipleChoiceEditorProps {
  stepIndex: number;
}

export const MultipleChoiceEditor = ({ stepIndex }: MultipleChoiceEditorProps) => {
  const { fields, arrayActions, optionsPath, handleMarkTarget, handleRemove, handleAdd, canAdd } =
    useMultipleChoiceOptions(stepIndex);

  return (
    <Stack spacing={1.5}>
      <Typography variant="label" color="text.secondary">
        Answer Options
      </Typography>

      <ArrayInput
        fields={fields}
        {...arrayActions}
        render={({ index, item }) => (
          <OptionItem
            index={index}
            option={item}
            fieldPath={`${optionsPath}.${index}`}
            onMarkTarget={() => handleMarkTarget(item.id)}
            onRemove={() => handleRemove(index)}
          />
        )}
      />

      <S.AddButton
        onClick={handleAdd}
        disabled={!canAdd}
        startIcon={<PlusIcon size={18} weight="bold" />}
      >
        Add Option {canAdd && `(${fields.length}/6)`}
      </S.AddButton>
    </Stack>
  );
};
