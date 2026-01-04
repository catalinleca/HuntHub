import { useFormContext, FieldError } from 'react-hook-form';
import get from 'lodash/get';

type ArrayFieldError = { root?: FieldError; message?: string };
type FormFieldError = FieldError | ArrayFieldError;

/**
 * Get field error message from form context by path.
 * Handles both direct field errors and array root errors (from superRefine).
 */
export const useFieldError = (name: string): string | undefined => {
  const {
    formState: { errors },
  } = useFormContext();

  const error = get(errors, name) as FormFieldError | undefined;

  return error?.message ?? error?.root?.message;
};
