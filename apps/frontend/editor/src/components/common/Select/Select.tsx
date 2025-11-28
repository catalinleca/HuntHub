import { Select as MuiSelect, MenuItem, SelectProps as MuiSelectProps } from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends Omit<MuiSelectProps, 'children'> {
  options: SelectOption[];
  placeholder?: string;
}

export const Select = ({ options, placeholder, ...props }: SelectProps) => {
  return (
    <MuiSelect displayEmpty label={null} {...props}>
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
    </MuiSelect>
  );
};