import { useFormContext, FieldError } from 'react-hook-form';
import get from 'lodash/get';

interface ArrayFieldError {
  root?: FieldError;
  message?: string;
}

/**
 * Get field error message from form context by path.
 * Handles both direct field errors and array root errors (from superRefine).
 * Returns the error message string or undefined.
 */
export const useFieldError = (name: string): string | undefined => {
  const {
    formState: { errors },
  } = useFormContext();

  const error = get(errors, name) as (FieldError & ArrayFieldError) | undefined;

  // Check direct message first, then root.message (for array schema-level errors)
  return error?.message ?? error?.root?.message;
};
