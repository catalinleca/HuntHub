import { TextField, FormHelperText, TextFieldProps } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { FormFieldProps } from '../types';
import { getNestedError, nameToId } from '../utils';
import { InputLabel, FieldContainer } from '../core';

export interface FormInputProps extends FormFieldProps<TextFieldProps> {
  placeholder?: string;
}

export const FormInput = ({ name, label, required, placeholder, helperText, disabled, ...props }: FormInputProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = getNestedError(errors, name);
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
        {...props}
      />
      {error && <FormHelperText error>{error}</FormHelperText>}
      {!error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FieldContainer>
  );
};
