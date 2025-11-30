import { forwardRef, memo, CSSProperties, HTMLAttributes } from 'react';
import { IconButton } from '@mui/material';
import { CheckIcon, DotsSixVerticalIcon, XIcon } from '@phosphor-icons/react';
import { FormInput } from '@/components/form';
import * as S from './OptionItem.styles';

export interface OptionItemProps {
  index: number;
  isTarget: boolean;
  fieldPath: string;
  onMarkTarget: () => void;
  onRemove: () => void;
  canRemove: boolean;
  style?: CSSProperties;
  dragHandleProps?: HTMLAttributes<HTMLDivElement>;
}

export const OptionItem = memo(
  forwardRef<HTMLDivElement, OptionItemProps>(function OptionItem(
    { index, isTarget, fieldPath, onMarkTarget, onRemove, canRemove, style, dragHandleProps },
    ref,
  ) {
    return (
      <S.OptionRow ref={ref} style={style}>
        <S.DragHandle {...dragHandleProps}>
          <DotsSixVerticalIcon size={20} weight="bold" />
        </S.DragHandle>

        <S.TargetCircle
          type="button"
          $isTarget={isTarget}
          onClick={onMarkTarget}
          aria-label={isTarget ? 'Correct answer' : `Mark option ${index + 1} as correct`}
        >
          {isTarget ? <CheckIcon size={16} weight="bold" /> : index + 1}
        </S.TargetCircle>

        <S.OptionInputWrapper $isTarget={isTarget}>
          <FormInput name={`${fieldPath}.text`} placeholder={`Option ${index + 1}`} label="" size="small" />
        </S.OptionInputWrapper>

        <IconButton size="small" onClick={onRemove} disabled={!canRemove}>
          <XIcon size={18} />
        </IconButton>
      </S.OptionRow>
    );
  }),
);
