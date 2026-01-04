import { TextField, FormHelperText, TextFieldProps } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { FormFieldProps } from '../types';
import { nameToId } from '../utils';
import { InputLabel, FieldContainer } from '../core';
import { useFieldError } from '@/hooks';

export interface FormTextAreaProps extends FormFieldProps<TextFieldProps> {
  placeholder?: string;
  rows?: number;
  maxRows?: number;
}

export const FormTextArea = ({
  name,
  label,
  required,
  placeholder,
  helperText,
  disabled,
  rows = 4,
  maxRows,
  ...props
}: FormTextAreaProps) => {
  const { register } = useFormContext();
  const error = useFieldError(name);
  const id = nameToId(name);

  return (
    <FieldContainer>
      <InputLabel htmlFor={id} required={required}>
        {label}
      </InputLabel>
      <TextField
        {...register(name)}
        id={id}
        placeholder={placeholder}
        error={Boolean(error)}
        disabled={disabled}
        label={null}
        fullWidth
        multiline
        rows={rows}
        maxRows={maxRows}
        {...props}
      />
      {error && <FormHelperText error>{error}</FormHelperText>}
      {!error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FieldContainer>
  );
};
