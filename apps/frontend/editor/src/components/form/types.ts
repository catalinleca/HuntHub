export interface FormFieldBaseProps {
  name: string;
  label: string;
  required?: boolean;
  helperText?: string;
  disabled?: boolean;
}


export type FormFieldProps<MuiProps, ExtraOmit extends string = never> = FormFieldBaseProps & Omit<MuiProps, keyof FormFieldBaseProps | ExtraOmit>
