import { useMemo } from 'react';
import { useFieldArray, useFormContext, UseFieldArrayReturn } from 'react-hook-form';

export type FieldArrayItem<T> = T & { readonly _id: string };

export interface ArrayActions {
  swap: UseFieldArrayReturn['swap'];
  remove: UseFieldArrayReturn['remove'];
  move: UseFieldArrayReturn['move'];
}

export interface UseArrayInputReturn<T extends object> extends Omit<UseFieldArrayReturn, 'fields'> {
  fields: FieldArrayItem<T>[];
  arrayActions: ArrayActions;
}

export const useArrayInput = <T extends object>(name: string): UseArrayInputReturn<T> => {
  const { control } = useFormContext();

  const {
    fields: rhfFields,
    swap,
    remove,
    move,
    ...rest
  } = useFieldArray({
    control,
    name,
    keyName: '_id',
  });

  const fields = (rhfFields ?? []) as FieldArrayItem<T>[];

  const arrayActions: ArrayActions = useMemo(() => ({ swap, remove, move }), [swap, remove, move]);

  return {
    fields,
    arrayActions,
    swap,
    remove,
    move,
    ...rest,
  };
};
