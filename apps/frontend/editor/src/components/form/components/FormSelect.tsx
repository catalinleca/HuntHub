import { FormHelperText, FormControl } from '@mui/material';
import { useFormContext, useController } from 'react-hook-form';
import { FormFieldProps } from '../types';
import { getNestedError, nameToId } from '../utils';
import { InputLabel, FieldContainer } from '../core';
import { Select, SelectOption, SelectProps } from '@/components/common';

export interface FormSelectProps extends FormFieldProps<Omit<SelectProps, 'options'>> {
  options: SelectOption[];
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
    control,
    formState: { errors },
  } = useFormContext();
  const { field } = useController({ name, control });

  const error = getNestedError(errors, name);
  const id = nameToId(name);

  return (
    <FieldContainer>
      <InputLabel htmlFor={id} required={required}>
        {label}
      </InputLabel>
      <FormControl fullWidth={true} error={Boolean(error)}>
        <Select {...field} id={id} options={options} placeholder={placeholder} disabled={disabled} {...props} />
      </FormControl>

      {error && <FormHelperText error>{error}</FormHelperText>}
      {!error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FieldContainer>
  );
};
