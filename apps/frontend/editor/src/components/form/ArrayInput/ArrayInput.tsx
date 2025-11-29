import React, { useMemo, ReactNode } from 'react';
import { ArrayInputProvider } from './ArrayInputContext';
import { ArrayActions, FieldArrayItem } from './useArrayInput';

export interface ArrayInputProps<T> extends ArrayActions {
  fields: FieldArrayItem<T>[];
  render: (props: { index: number; item: FieldArrayItem<T> }) => ReactNode;
}

export const ArrayInput = <T extends object>({ fields, swap, remove, move, render }: ArrayInputProps<T>) => {
  const contextValue = useMemo(
    () => ({ swap, remove, move, length: fields.length }),
    [swap, remove, move, fields.length],
  );

  return (
    <ArrayInputProvider value={contextValue}>
      {fields.map((item, index) => (
        <React.Fragment key={item._id}>{render({ index, item })}</React.Fragment>
      ))}
    </ArrayInputProvider>
  );
};
