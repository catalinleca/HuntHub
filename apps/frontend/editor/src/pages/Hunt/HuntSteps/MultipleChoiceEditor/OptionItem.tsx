import { memo } from 'react';
import { CheckIcon, ArrowUpIcon, ArrowDownIcon, XIcon } from '@phosphor-icons/react';
import { FormInput, useArrayInputItem } from '@/components/form';
import { QuizOptionFormData } from '@/types/editor';
import * as S from './OptionItem.styles';

interface OptionItemProps {
  index: number;
  option: QuizOptionFormData;
  fieldPath: string;
  onMarkTarget: () => void;
  onRemove: () => void;
}

export const OptionItem = memo(function OptionItem({
  index,
  option,
  fieldPath,
  onMarkTarget,
  onRemove,
}: OptionItemProps) {
  const { isFirst, isLast, onMoveUp, onMoveDown } = useArrayInputItem(index);

  return (
    <S.OptionRow $isTarget={option.isTarget}>
      <S.TargetCircle $isTarget={option.isTarget} onClick={onMarkTarget}>
        {option.isTarget ? <CheckIcon size={16} weight="bold" /> : index + 1}
      </S.TargetCircle>

      <S.InputWrapper>
        <FormInput name={`${fieldPath}.text`} label="" placeholder="Answer option..." size="small" />
      </S.InputWrapper>

      <S.Actions>
        <S.ActionButton size="small" onClick={onMoveUp} disabled={isFirst}>
          <ArrowUpIcon size={18} />
        </S.ActionButton>
        <S.ActionButton size="small" onClick={onMoveDown} disabled={isLast}>
          <ArrowDownIcon size={18} />
        </S.ActionButton>
        {!option.isTarget && (
          <S.ActionButton size="small" onClick={onRemove}>
            <XIcon size={18} />
          </S.ActionButton>
        )}
      </S.Actions>
    </S.OptionRow>
  );
});
