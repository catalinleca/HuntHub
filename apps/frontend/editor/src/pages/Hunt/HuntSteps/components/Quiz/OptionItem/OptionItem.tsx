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
  // DnD props (optional - only when wrapped by SortableOptionItem)
  style?: CSSProperties;
  dragHandleProps?: HTMLAttributes<HTMLDivElement>;
}

export const OptionItem = memo(
  forwardRef<HTMLDivElement, OptionItemProps>(function OptionItem(
    { index, isTarget, fieldPath, onMarkTarget, onRemove, canRemove, style, dragHandleProps },
    ref,
  ) {
    return (
      <S.OptionRow ref={ref} style={style} $isTarget={isTarget}>
        <S.DragHandle {...dragHandleProps}>
          <DotsSixVerticalIcon size={16} weight="bold" />
        </S.DragHandle>

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
  }),
);
