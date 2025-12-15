import { ReactNode } from 'react';
import { Stack, Typography, IconButton } from '@mui/material';
import { ArrowUpIcon, ArrowDownIcon, TrashIcon } from '@phosphor-icons/react';
import { useArrayInputItem } from './useArrayInputItem';

export interface ArrayInputElementProps {
  index: number;
  title?: string;
  children: ReactNode;
  showActions?: boolean;
}

export const ArrayInputElement = ({ index, title, children, showActions = true }: ArrayInputElementProps) => {
  const { isFirst, isLast, onMoveUp, onMoveDown, onRemove } = useArrayInputItem(index);

  return (
    <Stack spacing={2}>
      {(title || showActions) && (
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {title && <Typography variant="smMedium">{title}</Typography>}

          {showActions && (
            <Stack direction="row" spacing={1}>
              <IconButton size="small" onClick={onMoveUp} disabled={isFirst}>
                <ArrowUpIcon size={18} />
              </IconButton>
              <IconButton size="small" onClick={onMoveDown} disabled={isLast}>
                <ArrowDownIcon size={18} />
              </IconButton>
              <IconButton size="small" onClick={onRemove}>
                <TrashIcon size={18} />
              </IconButton>
            </Stack>
          )}
        </Stack>
      )}

      {children}
    </Stack>
  );
};
