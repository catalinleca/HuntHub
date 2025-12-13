import { Stack, IconButton, CircularProgress, Typography } from '@mui/material';
import { XIcon } from '@phosphor-icons/react';
import { useHuntDialogStore } from '@/stores';
import { useGetHunt } from '@/api/Hunt';
import { HuntDialogForm } from './HuntDialogForm';
import * as S from './HuntDialog.styles';

export const HuntDialog = () => {
  const { isOpen, huntId, close, clearData } = useHuntDialogStore();
  const isEditMode = huntId !== null;

  const { data: hunt, isLoading } = useGetHunt(huntId);

  const title = isEditMode ? 'Edit Hunt' : 'Create New Hunt';

  return (
    <S.Dialog open={isOpen} onClose={close} maxWidth="sm" fullWidth slotProps={{ transition: { onExited: clearData } }}>
      <S.Title>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">{title}</Typography>
          <IconButton onClick={close} edge="end" sx={{ color: 'common.white' }}>
            <XIcon size={24} />
          </IconButton>
        </Stack>
      </S.Title>

      <S.Content>
        {isEditMode && isLoading ? (
          <Stack justifyContent="center" alignItems="center" sx={{ py: 4 }}>
            <CircularProgress />
          </Stack>
        ) : (
          <HuntDialogForm hunt={hunt} />
        )}
      </S.Content>
    </S.Dialog>
  );
};
