import { FieldErrors, get } from 'react-hook-form';
import { HuntFormData } from '@/types/editor';

export const getNestedError = (errors: FieldErrors, name: string): string | undefined => {
  const error = get(errors, name);
  // Check direct message first, then root.message (for array schema-level errors from superRefine)
  return (error?.message ?? error?.root?.message) as string | undefined;
};

/**
 * Convert field name to valid HTML ID
 */
export const nameToId = (name: string): string => {
  return name.replace(/\./g, '-').replace(/\[(\d+)]/g, '-$1');
};

/**
 * Type helper to make all nested properties non-nullable
 * Used by getFieldPath for autocomplete support
 */
type NonNullableProps<T> = {
  [P in keyof T]-?: NonNullable<T[P]> extends object ? NonNullableProps<NonNullable<T[P]>> : NonNullable<T[P]>;
};

/**
 * Type-safe field path generator using Proxy
 * Provides autocomplete while returning a string path
 *
 * Solves: TypeScript loses type inference with dynamic array indices
 *
 * const titlePath = getFieldPath(h => h.hunt.steps[stepIndex].challenge.clue.title);
 * Returns: "hunt.steps.0.challenge.clue.title"
 *
 * */
export const getFieldPath = <T = { hunt: HuntFormData }>(accessor: (a: NonNullableProps<T>) => unknown): string => {
  const path: string[] = [];

  const proxy: unknown = new Proxy(
    {},
    {
      get(_, prop) {
        path.push(String(prop));
        return proxy;
      },
    },
  );

  accessor(proxy as NonNullableProps<T>);
  return path.join('.');
};
