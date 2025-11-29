import { Stack, Typography } from '@mui/material';
import { PlusIcon } from '@phosphor-icons/react';
import { useFormContext } from 'react-hook-form';
import { useArrayInput, ArrayInput } from '@/components/form';
import { QuizOptionFormData } from '@/types/editor';
import { OptionItem } from './OptionItem';
import * as S from './MultipleChoiceEditor.styles';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

interface MultipleChoiceEditorProps {
  stepIndex: number;
}

export const MultipleChoiceEditor = ({ stepIndex }: MultipleChoiceEditorProps) => {
  const optionsPath = `hunt.steps.${stepIndex}.challenge.quiz.options`;

  const { fields, arrayActions, append } = useArrayInput<QuizOptionFormData>(optionsPath);
  const { setValue } = useFormContext();

  const handleMarkTarget = (targetId: string) => {
    fields.forEach((field, idx) => {
      const shouldBeTarget = field.id === targetId;

      if (field.isTarget !== shouldBeTarget) {
        setValue(`${optionsPath}.${idx}.isTarget`, shouldBeTarget, { shouldDirty: true });
      }
    });
  };

  const handleRemove = (index: number) => {
    if (fields.length <= MIN_OPTIONS) {
      return;
    }

    const wasTarget = fields[index].isTarget;

    if (wasTarget) {
      const newTargetIndex = index === 0 ? 1 : 0;
      setValue(`${optionsPath}.${newTargetIndex}.isTarget`, true, { shouldDirty: true });
    }

    arrayActions.remove(index);
  };

  const handleAdd = () => {
    if (fields.length >= MAX_OPTIONS) {
      return;
    }

    const newId = crypto.randomUUID();
    append({ id: newId, text: '', isTarget: false, _id: newId });
  };

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
        disabled={fields.length >= MAX_OPTIONS}
        startIcon={<PlusIcon size={18} weight="bold" />}
      >
        Add Option {fields.length < MAX_OPTIONS && `(${fields.length}/${MAX_OPTIONS})`}
      </S.AddButton>
    </Stack>
  );
};
