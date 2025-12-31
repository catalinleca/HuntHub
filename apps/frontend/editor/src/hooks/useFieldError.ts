import { useFormContext, FieldError } from 'react-hook-form';
import get from 'lodash/get';

/**
 * Get field error message from form context by path.
 * Returns the error message string or undefined.
 */
export const useFieldError = (name: string): string | undefined => {
  const {
    formState: { errors },
  } = useFormContext();

  const error = get(errors, name) as FieldError | undefined;
  return error?.message;
};
