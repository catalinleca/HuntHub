import { memo } from 'react';
import { IconButton } from '@mui/material';
import { CheckIcon, XIcon } from '@phosphor-icons/react';
import { FormInput } from '@/components/form';
import * as S from './OptionItem.styles';

interface OptionItemProps {
  index: number;
  isTarget: boolean;
  fieldPath: string;
  onMarkTarget: () => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const OptionItem = memo(function OptionItem({
  index,
  isTarget,
  fieldPath,
  onMarkTarget,
  onRemove,
  canRemove,
}: OptionItemProps) {
  return (
    <S.OptionRow $isTarget={isTarget}>
      <S.TargetCircle $isTarget={isTarget} onClick={onMarkTarget}>
        {isTarget ? <CheckIcon size={16} weight="bold" /> : index + 1}
      </S.TargetCircle>

      <FormInput
        name={`${fieldPath}.text`}
        label=""
        placeholder={`Option ${index + 1}`}
        size="small"
        color={isTarget ? 'success' : undefined}
        sx={{ flex: 1 }}
      />

      <IconButton size="small" onClick={onRemove} disabled={!canRemove}>
        <XIcon size={18} />
      </IconButton>
    </S.OptionRow>
  );
});
