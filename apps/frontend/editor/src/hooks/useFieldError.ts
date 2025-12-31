import { useFormContext } from 'react-hook-form';
import { get } from 'lodash';

type FieldErrorResult = { message?: string } | undefined;

/**
 * Get field error from form context by path.
 * Useful for displaying errors on deeply nested fields.
 */
export const useFieldError = (name: string): FieldErrorResult => {
  const {
    formState: { errors },
  } = useFormContext();

  return get(errors, name);
};
