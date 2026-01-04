import { HuntFormData } from '@/types/editor';

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
