import { useFormContext, useWatch } from 'react-hook-form';
import { useArrayInput } from '@/components/form';
import { QuizOptionFormData } from '@/types/editor';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

export const useMultipleChoiceOptions = (stepIndex: number) => {
  const optionsPath = `hunt.steps.${stepIndex}.challenge.quiz.options`;
  const targetIdPath = `hunt.steps.${stepIndex}.challenge.quiz.targetId`;

  const { fields, arrayActions, append } = useArrayInput<QuizOptionFormData>(optionsPath);
  const { setValue } = useFormContext();

  const targetId = useWatch({ name: targetIdPath });

  const handleMarkTarget = (optionId: string) => {
    setValue(targetIdPath, optionId, { shouldDirty: true });
  };

  const handleRemove = (index: number) => {
    if (fields.length <= MIN_OPTIONS || index < 0 || index >= fields.length) {
      return;
    }

    const removedId = fields[index].id;

    if (removedId === targetId) {
      const newTargetId = fields[index === 0 ? 1 : 0].id;
      setValue(targetIdPath, newTargetId, { shouldDirty: true });
    }

    arrayActions.remove(index);
  };

  const handleAdd = () => {
    if (fields.length >= MAX_OPTIONS) {
      return;
    }
    const newId = crypto.randomUUID();
    append({ id: newId, text: '' });
  };

  return {
    fields,
    arrayActions,
    optionsPath,
    targetId,
    handleMarkTarget,
    handleRemove,
    handleAdd,
    canAdd: fields.length < MAX_OPTIONS,
    canRemove: fields.length > MIN_OPTIONS,
  };
};
