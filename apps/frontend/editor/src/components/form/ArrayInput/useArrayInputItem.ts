import { useMemo } from 'react';
import { useArrayInputContext } from './ArrayInputContext';
import { FieldArrayItem } from './useArrayInput';

export interface ArrayInputItemProps<T> {
  index: number;
  item: FieldArrayItem<T>;
}

export interface ArrayInputItemState {
  index: number;
  length: number;
  isFirst: boolean;
  isLast: boolean;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const useArrayInputItem = (index: number): ArrayInputItemState => {
  const { swap, remove, length } = useArrayInputContext();

  return useMemo(
    () => ({
      index,
      length,
      isFirst: index === 0,
      isLast: index === length - 1,
      onRemove: () => remove(index),
      onMoveUp: () => {
        if (index > 0) {
          swap(index, index - 1);
        }
      },
      onMoveDown: () => {
        if (index < length - 1) {
          swap(index, index + 1);
        }
      },
    }),
    [index, length, remove, swap],
  );
};
