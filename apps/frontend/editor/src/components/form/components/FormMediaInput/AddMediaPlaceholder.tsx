import { Typography } from '@mui/material';
import { ImageIcon } from '@phosphor-icons/react';
import * as S from './FormMediaInput.styles';

export interface AddMediaPlaceholderProps {
  disabled: boolean;
  onAdd: () => void;
}

export const AddMediaPlaceholder = ({ disabled, onAdd }: AddMediaPlaceholderProps) => {
  return (
    <S.AddMediaButton onClick={onAdd} disabled={disabled}>
      <ImageIcon size={20} aria-hidden="true" />
      <Typography variant="body2">Add media</Typography>
    </S.AddMediaButton>
  );
};
