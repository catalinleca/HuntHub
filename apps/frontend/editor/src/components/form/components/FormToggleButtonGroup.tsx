import React from 'react';
import { FormHelperText } from '@mui/material';
import { useFormContext, useController } from 'react-hook-form';
import { FormFieldProps } from '../types';
import { nameToId } from '../utils';
import { InputLabel, FieldContainer } from '../core';
import { ToggleButtonGroup, ToggleButtonGroupProps, ToggleButtonOption } from '@/components/common';
import { useFieldError } from '@/hooks';

export interface FormToggleButtonGroupProps extends FormFieldProps<Omit<ToggleButtonGroupProps, 'options'>> {
  options: ToggleButtonOption[];
}

export const FormToggleButtonGroup = ({
  name,
  label,
  required,
  options,
  helperText,
  disabled,
  ...props
}: FormToggleButtonGroupProps) => {
  const { control } = useFormContext();
  const { field } = useController({ name, control });
  const error = useFieldError(name);
  const id = nameToId(name);

  const handleChange = (_event: React.MouseEvent<HTMLElement>, newValue: string | null) => {
    if (newValue !== null) {
      field.onChange(newValue);
    }
  };

  return (
    <FieldContainer fullWidth={false}>
      {label && (
        <InputLabel htmlFor={id} required={required}>
          {label}
        </InputLabel>
      )}
      <ToggleButtonGroup
        value={field.value}
        onChange={handleChange}
        onBlur={field.onBlur}
        ref={field.ref}
        id={id}
        options={options}
        exclusive
        disabled={disabled}
        {...props}
      />
      {error && <FormHelperText error>{error}</FormHelperText>}
      {!error && helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FieldContainer>
  );
};
