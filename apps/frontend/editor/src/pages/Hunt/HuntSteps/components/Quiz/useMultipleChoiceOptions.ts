import { useFormContext } from 'react-hook-form';
import { useArrayInput } from '@/components/form';
import { QuizOptionFormData } from '@/types/editor';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

export const useMultipleChoiceOptions = (stepIndex: number) => {
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
    if (fields.length <= MIN_OPTIONS) return;

    const wasTarget = fields[index].isTarget;

    if (wasTarget) {
      const newTargetIndex = index === 0 ? 1 : 0;
      setValue(`${optionsPath}.${newTargetIndex}.isTarget`, true, { shouldDirty: true });
    }

    arrayActions.remove(index);
  };

  const handleAdd = () => {
    if (fields.length >= MAX_OPTIONS) return;

    const newId = crypto.randomUUID();
    append({ id: newId, text: '', isTarget: false, _id: newId });
  };

  return {
    fields,
    arrayActions,
    optionsPath,
    handleMarkTarget,
    handleRemove,
    handleAdd,
    canAdd: fields.length < MAX_OPTIONS,
    canRemove: fields.length > MIN_OPTIONS,
  };
};
