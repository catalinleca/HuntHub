import { TextField, FormHelperText, TextFieldProps } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { FormFieldProps } from '../types';
import { nameToId } from '../utils';
import { InputLabel, FieldContainer } from '../core';
import { useFieldError } from '@/hooks';

export interface FormNumberInputProps extends FormFieldProps<TextFieldProps> {
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

const numberRegisterOptions = {
  setValueAs: (value: string | number) => {
    if (value === '' || value == null) {
      return 0;
    }
    const numValue = Number(value);
    return isNaN(numValue) ? 0 : numValue;
  },
};

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
  const { register } = useFormContext();
  const error = useFieldError(name);
  const id = nameToId(name);

  return (
    <FieldContainer>
      <InputLabel htmlFor={id} required={required}>
        {label}
      </InputLabel>
      <TextField
        {...register(name, numberRegisterOptions)}
        id={id}
        type="number"
        placeholder={placeholder}
        error={Boolean(error)}
        disabled={disabled}
        label={null}
        fullWidth
        slotProps={{ htmlInput: { min, max, step } }}
        {...props}
      />
      {error && <FormHelperText error>{error}</FormHelperText>}
      {!error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FieldContainer>
  );
};
