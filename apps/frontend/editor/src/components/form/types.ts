export interface FormFieldBaseProps {
  name: string;
  label: string;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
}

/** Props we always control in form components */
type CommonControlledProps = 'error' | 'onChange';

export type FormFieldProps<
  MuiProps,
  ExtraOmit extends string = never
> = FormFieldBaseProps & Omit<MuiProps, keyof FormFieldBaseProps | CommonControlledProps | ExtraOmit>;
