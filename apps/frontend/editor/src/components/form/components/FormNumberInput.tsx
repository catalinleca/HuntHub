import { TextField, FormHelperText, TextFieldProps } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { FormFieldProps } from '../types';
import { getNestedError, nameToId } from '../utils';
import { InputLabel, FieldContainer } from '../core';

export interface FormNumberInputProps extends FormFieldProps<TextFieldProps> {
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const FormNumberInput = ({
  name,
  label,
  required,
  placeholder,
  helperText,
  disabled,
  min,
  max,
  step,
  ...props
}: FormNumberInputProps) => {
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
        {...register(name, { valueAsNumber: true })}
        id={id}
        type="number"
        placeholder={placeholder}
        error={Boolean(error)}
        disabled={disabled}
        label={null}
        fullWidth
        inputProps={{ min, max, step }}
        {...props}
      />
      {error && <FormHelperText error>{error}</FormHelperText>}
      {!error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FieldContainer>
  );
};
