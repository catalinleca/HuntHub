import { Checkbox, FormControlLabel, FormHelperText, CheckboxProps } from '@mui/material';
import { useFormContext, useController } from 'react-hook-form';
import { FormFieldProps } from '../types';
import { nameToId } from '../utils';
import { FieldContainer } from '../core';

export interface FormCheckboxProps extends FormFieldProps<CheckboxProps, 'checked' | 'onChange'> {}

export const FormCheckbox = ({ name, label, disabled, ...props }: FormCheckboxProps) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const id = nameToId(name);

  return (
    <FieldContainer>
      <FormControlLabel
        control={
          <Checkbox
            {...props}
            id={id}
            checked={Boolean(field.value)}
            onChange={(e) => field.onChange(e.target.checked)}
            onBlur={field.onBlur}
            disabled={disabled}
          />
        }
        label={label}
      />
      {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
    </FieldContainer>
  );
};
