import { Select, MenuItem, FormHelperText, FormControl, SelectProps } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { FormFieldProps } from '../types';
import { getNestedError, nameToId } from '../utils';
import { InputLabel, FieldContainer } from '../core';

export interface FormSelectOption {
  value: string | number;
  label: string;
}

export interface FormSelectProps extends FormFieldProps<SelectProps, 'error'> {
  options: FormSelectOption[];
  placeholder?: string;
}

export const FormSelect = ({
  name,
  label,
  required,
  options,
  placeholder,
  helperText,
  disabled,
  ...props
}: FormSelectProps) => {
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
      <FormControl fullWidth error={Boolean(error)}>
        <Select {...register(name)} id={id} displayEmpty disabled={disabled} label={null} {...props}>
          {placeholder && (
            <MenuItem value="" disabled>
              {placeholder}
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {error && <FormHelperText error>{error}</FormHelperText>}
      {!error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FieldContainer>
  );
};
